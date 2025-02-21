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

    // Fetch Bluebikes station data **after the map has loaded**
    const INPUT_BLUEBIKES_CSV_URL = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    
    d3.json(INPUT_BLUEBIKES_CSV_URL).then(jsonData => {
        console.log('Loaded JSON Data:', jsonData);  // Log to verify structure
        
        const stations = jsonData.data.stations;  // Extract station data
        console.log('Stations Array:', stations);

        // Select the existing SVG inside the map
        const svg = d3.select('#map').select('svg');

        // Append circles to the SVG for each station
        const circles = svg.selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', 5)               // Radius of the circle
            .attr('fill', 'steelblue')  // Circle fill color
            .attr('stroke', 'white')    // Circle border color
            .attr('stroke-width', 1)    // Circle border thickness
            .attr('opacity', 0.8);      // Circle opacity

        // Function to convert station coordinates to pixel positions
        function getCoords(station) {
            const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
            const { x, y } = map.project(point);  // Project to pixel coordinates
            return { cx: x, cy: y };  // Return as object for use in SVG attributes
        }

        // Function to update circle positions when the map moves/zooms
        function updatePositions() {
            circles
                .attr('cx', d => getCoords(d).cx)  // Set x-position using projected coordinates
                .attr('cy', d => getCoords(d).cy); // Set y-position using projected coordinates
        }

        // Initial position update when data loads
        updatePositions();

        // Reposition markers on map interactions
        map.on('move', updatePositions);     // Update during map movement
        map.on('zoom', updatePositions);     // Update during zooming
        map.on('resize', updatePositions);   // Update on window resize
        map.on('moveend', updatePositions);  // Final adjustment after movement ends

    }).catch(error => {
        console.error('Error loading JSON:', error);  // Handle errors if JSON loading fails
    });

});

