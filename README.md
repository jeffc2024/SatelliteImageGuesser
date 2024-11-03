Here’s a comprehensive README.md for your SatelliteGuesser project, detailing the setup, usage, and functionality of the application.

SatelliteGuesser
SatelliteGuesser is a geographic guessing game inspired by popular geo-guessing games. Players are shown a random satellite image of a location on Earth and must guess its location by clicking on an embedded Google Map. The closer the guess, the more points are awarded. Each round generates a new random location, allowing players to explore the globe!

Table of Contents
Features
Project Structure
Setup Instructions
Usage
Technologies Used
API Key Management
License

Features
 - Random Location Generation on Continents: Generates random coordinates on or near the continents.
 - Satellite Image Zoom Adjustment: Ensures images are at an appropriate zoom level to avoid out-of-range errors.
 - Dynamic Scoring: Scores are based on how close a guess is to the actual location, with a maximum possible radius of 2000 miles.
 - Username Input and Game History: Allows players to enter a username and log their scores and rounds in a history file.
 - User-Friendly Interface: Simple interface for entering guesses, viewing scores, and starting or quitting games.
   
Project Structure
SatelliteGuesser/
├── app.py                 # Main Flask backend for managing game logic and routing
├── .env                   # Environment file for storing the Google Maps API key
├── requirements.txt       # List of project dependencies
├── game_history.txt       # Log file storing game history for each player
├── templates/
│   └── index.html         # Main HTML template for the frontend
├── static/
│   ├── css/
│   │   └── styles.css     # CSS file for styling the application
│   ├── js/
│   │   └── app.js         # JavaScript file for handling frontend logic
└── README.md              # Project documentation

Setup Instructions
Prerequisites
Python 3.x
Google Maps API Key (for Maps and Satellite services)
Recommended: Set up a virtual environment for isolated dependencies

Step 1: Clone the Repository
Clone this repository to your local machine:
git clone https://github.com/yourusername/SatelliteGuesser.git
cd SatelliteGuesser

Step 2: Install Dependencies
Install the required Python packages using pip:
pip install -r requirements.txt

Step 3: Configure Environment Variables
Create a .env file in the root directory.
Add your Google Maps API key to the .env file:
GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY
Replace YOUR_ACTUAL_API_KEY with your actual Google Maps API key.

Step 4: Run the Application
Start the Flask server with:
python app.py
The application will run at http://127.0.0.1:5000. Open this URL in your browser to play the game.

Usage
1. Enter a Username: Enter your username in the input field and press "Start" to begin.
2. Guess the Location: Look at the satellite image on the right and click on the map where you think the location is.
3. Scoring: Points are awarded based on your guess's proximity to the correct location. The closer the guess, the higher the score.
4. Rounds and History: Each round, a new location is generated. Game data is stored in game_history.txt with username, rounds played, and total score.
5. Quitting and Restarting: Press "Quit" to end the game. The game resets, allowing you to enter a new username.

Technologies Used
Python (Flask): Backend server to handle routing and game logic.
JavaScript: Frontend logic for handling map clicks and user interactions.
Google Maps API: Provides the map and satellite images used in the game.
HTML/CSS: Structure and styling of the web application.

API Key Management
For security, the Google Maps API key is stored in a .env file and loaded through python-dotenv. The key is only used in the frontend when necessary.
Instructions:
Add the API key to .env as GOOGLE_MAPS_API_KEY.
app.py loads the API key and passes it to index.html.
The frontend (app.js) dynamically accesses the key for satellite image requests.
Note: Do not hardcode API keys directly in the codebase. Instead, use environment variables to keep them secure.

License
This project is licensed under the MIT License. Feel free to use, modify, and distribute this project.


