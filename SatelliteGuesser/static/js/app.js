let map;
let score = 0;
let round = 0;
let targetLocation = { lat: 34.0522, lng: -118.2437 };
let maxZoomService;
let guessMarker;
let correctMarker;
let selectedGuess = null;

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

    // Initialize markers, initially hidden
    guessMarker = new google.maps.Marker({
        map: map,
        visible: false,
    });

    correctMarker = new google.maps.Marker({
        map: map,
        visible: false,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
    });

    map.addListener("click", function(e) {
        // Update guessMarker position based on user's new click
        selectedGuess = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        guessMarker.setPosition(selectedGuess);
        guessMarker.setVisible(true);

        // Hide the correct marker, ready for the new round
        correctMarker.setVisible(false);

        // Show the Confirm Guess button
        document.getElementById("confirm-btn").style.display = "inline";
    });
}

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("quit-btn").addEventListener("click", endGame);
document.getElementById("confirm-btn").addEventListener("click", confirmGuess);

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
        document.getElementById("username").style.display = "none";
        updateSatelliteImage(targetLocation);
        clearScoreTable();

        // Hide markers and confirm button at the start of a new game
        guessMarker.setVisible(false);
        correctMarker.setVisible(false);
        document.getElementById("confirm-btn").style.display = "none";
    });
}

function confirmGuess() {
    if (!selectedGuess) return;

    const { lat, lng } = selectedGuess;

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
        updateScoreTable(round, data.points);

        // Show the correct marker at the target location and keep it visible until the next guess
        correctMarker.setPosition({ lat: targetLocation.lat, lng: targetLocation.lng });
        correctMarker.setVisible(true);

        // Generate a new target location for the next round
        targetLocation = data.new_target;
        updateSatelliteImage(targetLocation);

        // Hide the Confirm Guess button until the next guess
        document.getElementById("confirm-btn").style.display = "none";
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
    score = 0;
    round = 0;
    document.getElementById("score").innerText = score;
    document.getElementById("start-btn").style.display = "inline";
    document.getElementById("quit-btn").style.display = "none";

    const usernameInput = document.getElementById("username");
    usernameInput.value = "";
    usernameInput.style.display = "inline";
    document.getElementById("start-btn").disabled = true;

    guessMarker.setVisible(false);
    correctMarker.setVisible(false);
    document.getElementById("confirm-btn").style.display = "none";
    clearScoreTable();
}

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
