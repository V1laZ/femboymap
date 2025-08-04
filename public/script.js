const map = L.map('map', {
  maxBounds: [[-90, -180], [90, 180]],
  maxBoundsViscosity: 1.0,
  minZoom: 3
}).setView([40.7128, -74.0060], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let markerClusterGroup = L.markerClusterGroup({
  chunkedLoading: true,
  chunkProgress: function (processed, total) {
    if (processed === total) {
      console.log('Finished loading', total, 'markers');
    }
  },
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

let allMarkers = [];

const customIcon = L.divIcon({
  className: 'custom-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function showStatus(message, type) {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

async function loadMarkers() {
  try {
    const response = await fetch('/api/markers');
    if (response.ok) {
      const markers = await response.json();

      markerClusterGroup.clearLayers();
      allMarkers = [];

      const markerArray = [];
      markers.forEach(markerData => {
        const marker = L.marker([markerData.latitude, markerData.longitude], {
          icon: customIcon
        });

        const popupContent = `
                    <div>
                        A femboy is here! 💖
                    </div>
                `;

        marker.bindPopup(popupContent);
        markerArray.push(marker);
        allMarkers.push(marker);
      });

      markerClusterGroup.addLayers(markerArray);

      if (!map.hasLayer(markerClusterGroup)) {
        map.addLayer(markerClusterGroup);
      }

      showStatus(`Loaded ${markers.length} markers`, 'success');
    } else {
      throw new Error('Failed to load markers');
    }
  } catch (error) {
    console.error('Error loading markers:', error);
    showStatus('Failed to load markers. Please try again later.', 'error');
  }
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      map.setView([lat, lng], 10);
    },
    (error) => {
      console.log('Geolocation not available or denied');
    }
  );
}

loadMarkers();
