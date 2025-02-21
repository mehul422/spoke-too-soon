// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWV2ZXJtYSIsImEiOiJjbTdlZ3N2c3YwZXNvMnNxM3E0aGhmdTNpIn0.D9hqfcrunVuizVHn-NBhNg';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // Map style
    center: [-71.09415, 42.36027], // [longitude, latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18 // Maximum allowed zoom
});

map.on('load', () => { 
    // Add Boston bike lanes
    map.addSource('boston_data_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
    });
    map.addLayer({
        id: 'boston-bike-lanes', // Unique ID for Boston's bike lanes
        type: 'line',
        source: 'boston_data_route',
        paint: {
            'line-color': '#32D400',
            'line-width': 5,
            'line-opacity': 0.6
        }
    });

    // Add Cambridge bike lanes
    map.addSource('cambridge_data_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });
    map.addLayer({
        id: 'cambridge-bike-lanes', // Unique ID for Cambridge's bike lanes
        type: 'line',
        source: 'cambridge_data_route',
        paint: {
            'line-color': '#32D400',
            'line-width': 5,
            'line-opacity': 0.6
        }
    });        
});

const INPUT_BLUEBIKES_CSV_URL = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

map.on('load', () => {
    // Load the nested JSON file
    const jsonurl = INPUT_BLUEBIKES_CSV_URL;
    
    d3.json(jsonurl).then(jsonData => {
        console.log('Loaded JSON Data:', jsonData);  // Log to verify structure
        
        // Extract stations array INSIDE the .then() block
        const stations = jsonData.data.stations;
        console.log('Stations Array:', stations);
        
        // Now you can use 'stations' inside this block
    }).catch(error => {
        console.error('Error loading JSON:', error);  // Handle errors if JSON loading fails
    });

});

