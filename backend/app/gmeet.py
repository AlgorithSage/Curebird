from flask import Blueprint, jsonify, request, redirect
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import json

gmeet_bp = Blueprint('gmeet', __name__)

# Allow non-HTTPS for local dev
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Path to client_secrets.json (Start from current file location, go up to backend root)
# Alternatively, check for it in current working directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # points to backend/ or backend/app/..
CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(BASE_DIR), 'client_secret.json') # Try to find it in root of project or backend/

# Fallback locations if not found
if not os.path.exists(CLIENT_SECRETS_FILE):
    CLIENT_SECRETS_FILE = "client_secret.json" # Relative to run.py

SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar']
REDIRECT_URI = 'http://localhost:5001/auth/callback' # Matching run.py port

# Global variable to store credentials (DEMO ONLY - Use DB in production)
global_creds = None

@gmeet_bp.route("/auth/google", methods=['GET'])
def auth_google():
    try:
        if not os.path.exists(CLIENT_SECRETS_FILE):
             return jsonify({"error": "client_secret.json not found. Please add it to backend folder."}), 500

        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return jsonify({"url": authorization_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gmeet_bp.route("/auth/callback", methods=['GET'])
def auth_callback():
    code = request.args.get('code')
    if not code:
         return jsonify({"error": "No code provided"}), 400
         
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        global global_creds
        global_creds = credentials
        
        # Redirect back to frontend
        return redirect("http://localhost:3000/doctor/dashboard") # Adjust as needed
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gmeet_bp.route("/create-meet", methods=['POST'])
def create_meet():
    global global_creds
    if not global_creds:
         return jsonify({"error": "User not authenticated. Please Link Google Account first."}), 401

    try:
        service = build('calendar', 'v3', credentials=global_creds)

        event = {
            'summary': 'CureBird Telehealth Session',
            'description': 'Secure consultation via CureBird.',
            'start': {'dateTime': '2024-01-01T09:00:00-07:00'}, # In real app, use current or scheduled time
            'end': {'dateTime': '2024-01-01T09:30:00-07:00'},
            'conferenceData': {
                'createRequest': {'requestId': "sample123", 'conferenceSolutionKey': {'type': 'hangoutsMeet'}}
            },
        }

        event = service.events().insert(
            calendarId='primary', 
            body=event, 
            conferenceDataVersion=1
        ).execute()

        return jsonify({"meetLink": event.get('hangoutLink')})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
