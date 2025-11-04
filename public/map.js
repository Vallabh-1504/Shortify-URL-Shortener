document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize the map
    const map = L.map('map').setView([20, 0], 3);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Get list elements
    const countryList = document.getElementById('country-list');
    const cityList = document.getElementById('city-list');

    try {
        // 2. Fetch the structured analytics data
        // const urlId = '<%= url._id %>';
        const response = await fetch(`/url/${urlId}/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics data');
        
        // Destructure our data object
        const { mapData, topCountries, topCities } = await response.json();

        // 3. Populate the Map
        if (mapData.length > 0) {
            // Create a cluster group
            const markers = L.markerClusterGroup();
            
            mapData.forEach(loc => {
                const popupText = `<b>${loc.name}</b><br>Total Clicks: ${loc.count}`;
                // Create a marker and add it to the cluster group
                markers.addLayer(L.marker([loc.lat, loc.lng]).bindPopup(popupText));
            });

            // Add the entire cluster group to the map
            map.addLayer(markers);
            // Fit the map to show all markers
            map.fitBounds(markers.getBounds().pad(0.1), {maxZoom: 3}); 
        } else {
             L.marker([20, 0]).addTo(map)
                 .bindPopup('No click data yet.').openPopup();
        }

        // 4. Populate the Top Countries List
        if (topCountries.length > 0) {
            topCountries.forEach(country => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `<span>${country.name}</span><span class="badge bg-primary rounded-pill">${country.count}</span>`;
                countryList.appendChild(li);
            });
        } else {
            countryList.innerHTML = '<li class="list-group-item">No data</li>';
        }

        // 5. Populate the Top Cities List
        if (topCities.length > 0) {
            topCities.forEach(city => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `<span>${city.name}</span><span class="badge bg-primary rounded-pill">${city.count}</span>`;
                cityList.appendChild(li);
            });
        } else {
            cityList.innerHTML = '<li class="list-group-item">No data</li>';
        }

    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('map').innerHTML = '<p class="text-danger p-3">Could not load analytics data.</p>';
        countryList.innerHTML = '<li class="list-group-item text-danger">Could not load</li>';
        cityList.innerHTML = '<li class="list-group-item text-danger">Could not load</li>';
    }
});