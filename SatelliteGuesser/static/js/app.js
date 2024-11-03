// static/js/app.js
let map;
let score = 0;
let round = 0;
let targetLocation = { lat: 34.0522, lng: -118.2437 };
let maxZoomService;

document.getElementById("username").addEventListener("input", function() {
    const username = document.getElementById("username").value;
    document.getElementById("start-btn").disabled = username.trim() === "";
});

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: targetLocation,
    });

    maxZoomService = new google.maps.MaxZoomService();

    map.addListener("click", function(e) {
        handleGuess(e.latLng.lat(), e.latLng.lng());
    });
}

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("quit-btn").addEventListener("click", endGame);

function startGame() {
    const username = document.getElementById("username").value;

    fetch('/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        targetLocation = data.target;
        document.getElementById("start-btn").style.display = "none";
        document.getElementById("quit-btn").style.display = "inline";
        document.getElementById("username").style.display = "none";  // Hide username input after starting
        updateSatelliteImage(targetLocation);
        clearScoreTable();
    });
}

function handleGuess(lat, lng) {
    fetch('/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: lat, lng: lng, target: targetLocation })
    })
    .then(response => response.json())
    .then(data => {
        score += data.points;
        round += 1;
        document.getElementById("score").innerText = score;
        targetLocation = data.new_target;
        updateSatelliteImage(targetLocation);
        updateScoreTable(round, data.points);
    });
}

function endGame() {
    fetch('/end', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            resetGame();
        });
}

function resetGame() {
    // Reset score and rounds
    score = 0;
    round = 0;
    document.getElementById("score").innerText = score;

    // Show start button and hide quit button
    document.getElementById("start-btn").style.display = "inline";
    document.getElementById("quit-btn").style.display = "none";

    // Clear and show the username input field
    const usernameInput = document.getElementById("username");
    usernameInput.value = "";  // Clear the input
    usernameInput.style.display = "inline";  // Show the input field again
    document.getElementById("start-btn").disabled = true;  // Disable start button until a new username is entered

    // Clear the score table
    clearScoreTable();
}

// Function to update satellite image with appropriate zoom level
function updateSatelliteImage(location) {
    const lat = location.lat;
    const lng = location.lng;
    const desiredZoom = 11;

    maxZoomService.getMaxZoomAtLatLng({ lat: lat, lng: lng }, (response) => {
        let zoom = desiredZoom;
        if (response.status === google.maps.MaxZoomStatus.OK) {
            zoom = Math.min(desiredZoom, response.zoom);
        }

        const size = '400x400';
        const mapType = 'satellite';
        const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=${mapType}&key=${GOOGLE_MAPS_API_KEY}`;
        document.getElementById("satellite-image").src = url;
    });
}


function updateScoreTable(round, points) {
    const table = document.getElementById("score-table");
    const row = table.insertRow(-1);
    const cellRound = row.insertCell(0);
    const cellPoints = row.insertCell(1);
    cellRound.innerHTML = round;
    cellPoints.innerHTML = points;
}

function clearScoreTable() {
    const table = document.getElementById("score-table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}

window.onload = initMap;
