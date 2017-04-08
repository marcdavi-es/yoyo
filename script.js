const loader = document.querySelector('#loader');
const message = document.querySelector('#message');
const button = document.querySelector('#message #button');
const burger = document.querySelector('#burger');
const menuWrapper = document.querySelector('#menu-wrapper');
const targetButtons = document.querySelectorAll('#menu .target');

const targets = {
  mercatLlibertat: {lat:41.399953, lng:2.153601},
  sagradaFamilia: {lat:41.4036299, lng:2.1721618},
  placaSantJaume: {lat:41.3826337, lng:2.174833}
}

let map, userMarker, targetMarker, watchId, directions, directionsRenderer;

loader.addEventListener('transitionend', function () {
  this.classList.add('hidden')
})

button.onclick = () => window.location.href = 'https://instagram.com';
burger.onclick = () => menuWrapper.classList.remove('off');
menuWrapper.onclick = e => {
  if (e.target.id !== 'menu-wrapper') return false;
  menuWrapper.classList.add('off');
}

targetButtons.forEach(targetButton => {
  targetButton.onclick = e => {
    // reconfigure map
    if (targetMarker) targetMarker.setMap(null);
    if (directionsRenderer) directionsRenderer.setMap(null);
    const pos = targets[e.target.dataset.target];
    const text = e.target.innerHTML;
    targetMarker = new google.maps.Marker({
      map: map,
      position: pos,
      title: text
    });
    targetMarker.addListener('click', handleTargetMarkerClick)
    map.setCenter(pos);
    // map.setZoom(14);
    // reset geolocation watch
    navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      watchSuccess,
      (e) => console.error(e)
    );
    // set DOM
    document.querySelector('#message p').innerHTML = `Looks like you're at<br>${text}`;
    message.classList.add('hidden');
    menuWrapper.classList.add('off');
  }
})

function haversineDistance (coords1, coords2) {
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(coords1.lat)) *
          Math.cos(toRad(coords2.lat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 12742 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad (x) {
    return x * Math.PI / 180;
}

function watchSuccess (position) {
  const pos = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  userMarker.setPosition(pos);
  loader.classList.add('nopacity');
  if (haversineDistance(pos, targetMarker.getPosition().toJSON()) < 0.05) {
    map.setCenter({
      lat: pos.lat + 0.001,
      lng: pos.lng
    });
    map.setZoom(17);
    message.classList.remove('hidden');
  } else {
    message.classList.add('hidden');
  }
}

function handleTargetMarkerClick () {
  directions = new google.maps.DirectionsService()
  directions.route({
    destination: targetMarker.getPosition().toJSON(),
    origin: userMarker.getPosition().toJSON(),
    travelMode: google.maps.TravelMode.WALKING
  }, (result, status) => {
    if (status === 'OK') {
      directionsRenderer = new google.maps.DirectionsRenderer({
        directions: result,
        map: map,
        markerOptions: {visible: false}
      })
    }
  })
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    backgroundColor: '#ffc0c0',
    center: targets.mercatLlibertat,
    clickableIcons: false,
    disableDefaultUI: true,
    minZoom: 12,
    scrollwheel: true,
    zoom: 14
  });

  targetMarker = new google.maps.Marker({
    map: map,
    position: targets.mercatLlibertat,
    title: 'Mercat de la Llibertat'
  });

  targetMarker.addListener('click', handleTargetMarkerClick)

  userMarker = new google.maps.Marker({
    map: map,
    icon: {
      url:'circle-256.ico',
      scaledSize: {
        height: 15,
        width: 15
      }
    },
    title: 'User'
  });

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      watchSuccess,
      (e) => console.error(e)
    );
  } else {
    console.error('Argh. No geolocation.')
  }
}
