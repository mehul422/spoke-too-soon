  // Set your Mapbox access token here
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
    map.addSource('boston_data_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
      });
    map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'boston_data_route',
        paint: {
          'line-color': '#32D400',
          'line-width': 5,
          'line-opacity': 0.6
        }
      });  
  });

  map.on('load', () => { 
    map.addSource('cambridge_data_route', {
        type: 'geojson',
        data: 'https://data.cambridgema.gov/api/geospatial/9aey-9g9p?method=export&format=GeoJSON'
      });
    map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'cambridge_data_route',
        paint: {
          'line-color': '#32D400',
          'line-width': 5,
          'line-opacity': 0.6
        }
      });        
  });