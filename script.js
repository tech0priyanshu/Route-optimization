const inputJourney = document.querySelector(".input_journey");
const submit = document.getElementById("submit");
const output = document.querySelector(".output");

const port = process.env.mapAPI
const url = process.env.url

submit.addEventListener("click", (e) => {
    e.preventDefault();

    const fromLocation = document.getElementById("from").value;
    const toLocation = document.getElementById("to").value;

    localStorage.setItem("from", fromLocation);
    localStorage.setItem("to", toLocation);

    inputJourney.style.display = "none";
    output.style.display = "block";

    alert("Finding the best and optimized route...");

    geocodeLocation(fromLocation, (fromGeocode) => {
        console.log("From Geocode: ", fromGeocode);

        geocodeLocation(toLocation, (toGeocode) => {
            console.log("To Geocode: ", toGeocode);

            fetch('url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: { lat: fromGeocode.lat, lng: fromGeocode.lng },
                    to: { lat: toGeocode.lat, lng: toGeocode.lng }
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "OK") {
                        initMap(data.route);
                    } else {
                        alert("Could not find the route: " + data.message);
                    }
                })
                .catch(error => alert("Error: " + error));
        });
    });
});

function geocodeLocation(location, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const geocode = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                callback(geocode);
            } else {
                alert("Location not found for: " + location);
            }
        })
        .catch(error => {
            alert("Geocoding error: " + error);
        });
}

function initMap(route) {
    const map = L.map('map').setView([route[0].lat, route[0].lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://api.maptiler.com/tiles/satellite-mediumres/?key=mapAPI#', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Map route points
    const latlngs = route.map(point => [point.lat, point.lng]);

    // Draw the route as a polyline
    const polyline = L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(map);

    // Adjust the map view to fit the route
    map.fitBounds(polyline.getBounds());
}
