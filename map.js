// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWV2ZXJtYSIsImEiOiJjbTdlZ3N2c3YwZXNvMnNxM3E0aGhmdTNpIn0.D9hqfcrunVuizVHn-NBhNg';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
    minZoom: 5,
    maxZoom: 18
});

map.on('load', () => { 
    // Fetch Bluebikes station and trip data
    const INPUT_BLUEBIKES_CSV_URL = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    const INPUT_TRAFFIC_CSV_URL = 'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv';

    Promise.all([
        d3.json(INPUT_BLUEBIKES_CSV_URL),
        d3.csv(INPUT_TRAFFIC_CSV_URL)
    ]).then(([jsonData, trips]) => {
        let stations = jsonData.data.stations;

        trips.forEach(trip => {
            trip.started_at = new Date(trip.start_time);
            trip.ended_at = new Date(trip.end_time);
        });

        function minutesSinceMidnight(date) {
            return date.getHours() * 60 + date.getMinutes();
        }

        let filteredTrips = [], filteredArrivals = new Map(), filteredDepartures = new Map(), filteredStations = [];
        let timeFilter = -1;

        function filterTripsByTime() {
            filteredTrips = timeFilter === -1
                ? trips
                : trips.filter(trip => {
                    const startedMinutes = minutesSinceMidnight(trip.started_at);
                    const endedMinutes = minutesSinceMidnight(trip.ended_at);
                    return (
                        Math.abs(startedMinutes - timeFilter) <= 60 ||
                        Math.abs(endedMinutes - timeFilter) <= 60
                    );
                });

            filteredArrivals = d3.rollup(filteredTrips, v => v.length, d => d.end_station_id);
            filteredDepartures = d3.rollup(filteredTrips, v => v.length, d => d.start_station_id);

            filteredStations = stations.map(station => {
                let id = station.short_name;
                return {
                    ...station,
                    arrivals: filteredArrivals.get(id) ?? 0,
                    departures: filteredDepartures.get(id) ?? 0,
                    totalTraffic: (filteredArrivals.get(id) ?? 0) + (filteredDepartures.get(id) ?? 0)
                };
            });

            console.log("🚦 Filtered Stations Traffic:", filteredStations.map(s => s.totalTraffic));
        }

        filterTripsByTime();

        // Define radius scale
        let radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(filteredStations, d => d.totalTraffic) || 1])
            .range([5, 50]);  // 🔹 Increased minimum radius

        const svg = d3.select('#map').select('svg');
        
        function getCoords(station) {
            const point = new mapboxgl.LngLat(+station.lon, +station.lat);
            const { x, y } = map.project(point);
            return { cx: x, cy: y };
        }

        function updateCircles() {
            console.log("🔄 Updating Circles...");

            const circles = svg.selectAll('circle')
                .data(filteredStations, d => d.short_name);

            circles.enter()
                .append('circle')
                .attr('fill', 'steelblue')
                .attr('stroke', 'white')
                .attr('stroke-width', 1)
                .attr('opacity', 0.8)
                .merge(circles)  // 🔹 Merge enter and update
                .transition().duration(500)
                .attr('cx', d => getCoords(d).cx)
                .attr('cy', d => getCoords(d).cy)
                .attr('r', d => radiusScale(d.totalTraffic));

            circles.exit().remove();
        }

        updateCircles();
        map.on('move', updateCircles);
        map.on('zoom', updateCircles);

        const timeSlider = document.getElementById('time-slider');
        const selectedTime = document.getElementById('selected-time');
        const anyTimeLabel = document.getElementById('any-time');

        function formatTime(minutes) {
            const date = new Date(0, 0, 0, 0, minutes);
            return date.toLocaleString('en-US', { timeStyle: 'short' });
        }

        function updateTimeDisplay() {
            timeFilter = Number(timeSlider.value);
            if (timeFilter === -1) {
                selectedTime.textContent = '';
                anyTimeLabel.style.display = 'block';
            } else {
                selectedTime.textContent = formatTime(timeFilter);
                anyTimeLabel.style.display = 'none';
            }

            filterTripsByTime();

            const maxTraffic = d3.max(filteredStations, d => d.totalTraffic) || 1;
            radiusScale.domain([0, maxTraffic]);

            console.log("📏 Max Traffic:", maxTraffic);
            console.log("🎯 Updated Radius Scale:", radiusScale.range());

            updateCircles();
        }        

        timeSlider.addEventListener('input', updateTimeDisplay);
        updateTimeDisplay();
    }).catch(error => {
        console.error('❌ Error loading JSON or CSV:', error);
    });
});