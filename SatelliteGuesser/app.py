# app.py
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import math
import random
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file
app = Flask(__name__)

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Initialize game state
game_data = {"username": "", "score": 0, "rounds": 0, "round_scores": []}

# Helper function to calculate distance in miles between two coordinates
def calculate_distance(lat1, lng1, lat2, lng2):
    earth_radius = 3958.8  # Radius of Earth in miles
    lat_diff = math.radians(lat2 - lat1)
    lng_diff = math.radians(lng2 - lng1)
    a = math.sin(lat_diff / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(lng_diff / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius * c

# Define latitude and longitude ranges for each continent
continent_ranges = {
    "Africa": {"lat_range": (-35, 37), "lng_range": (-17, 51)},
    "Asia": {"lat_range": (1, 55), "lng_range": (34, 180)},
    "Europe": {"lat_range": (36, 71), "lng_range": (-25, 45)},
    "North America": {"lat_range": (5, 71), "lng_range": (-167, -52)},
    "South America": {"lat_range": (-55, 12), "lng_range": (-81, -35)},
    "Australia": {"lat_range": (-44, -10), "lng_range": (113, 153)},
    "Antarctica": {"lat_range": (-90, -60), "lng_range": (-180, 180)},
}

# Function to generate random coordinates on or near the continents
def generate_random_coordinates():
    # Randomly select a continent
    continent = random.choice(list(continent_ranges.keys()))
    # Get the latitude and longitude range for the selected continent
    lat_range = continent_ranges[continent]["lat_range"]
    lng_range = continent_ranges[continent]["lng_range"]
    # Generate random latitude and longitude within the selected range
    latitude = random.uniform(*lat_range)
    longitude = random.uniform(*lng_range)
    return {"lat": latitude, "lng": longitude}

@app.route('/')
def index():
    return render_template('index.html', api_key=GOOGLE_MAPS_API_KEY)

@app.route('/start', methods=['POST'])
def start_game():
    data = request.json
    game_data["username"] = data.get("username", "Unknown")  # Get username from request
    game_data["score"] = 0
    game_data["rounds"] = 0
    game_data["round_scores"] = []
    
    # Generate initial random target location
    target_location = generate_random_coordinates()
    return jsonify({"message": "Game started", "target": target_location})

@app.route('/guess', methods=['POST'])
def process_guess():
    data = request.json
    user_lat = data['lat']
    user_lng = data['lng']
    target_lat = data['target']['lat']
    target_lng = data['target']['lng']

    # Calculate distance in miles
    distance = calculate_distance(user_lat, user_lng, target_lat, target_lng)
    
    # Calculate points: 0 points if outside 3000-mile radius, otherwise max 2000 points scaled by proximity
    points = 0 if distance > 3000 else int(max(0, 3000 - distance))
    
    game_data["score"] += points
    game_data["rounds"] += 1
    game_data["round_scores"].append(points)

    # Generate a new random target location for the next round
    new_target = generate_random_coordinates()
    return jsonify({"points": points, "score": game_data["score"], "new_target": new_target})

@app.route('/end', methods=['POST'])
def end_game():
    date_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("game_history.txt", "a") as file:
        file.write(f"{date_time}, Username: {game_data['username']}, Rounds: {game_data['rounds']}, "
                   f"Score: {game_data['score']}, Round Scores: {game_data['round_scores']}\n")
    return jsonify({"message": "Game ended and saved."})

if __name__ == "__main__":
    app.run(debug=True)