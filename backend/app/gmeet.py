from flask import Blueprint, jsonify, request, redirect
try:
    from google.apps import meet_v2
    HAS_GMEET_APPS = True
except ImportError:
    meet_v2 = None
    HAS_GMEET_APPS = False
    print("WARNING: google-apps-meet not found. Google Meet creation will fail.")
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

gmeet_bp = Blueprint('gmeet', __name__)

# Allow non-HTTPS for local dev
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
# Relax scope validation
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

# UPDATED SCOPE FOR MEET API V2 + Default OpenID scopes
SCOPES = [
    'https://www.googleapis.com/auth/meetings.space.created',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
    'https://www.googleapis.com/auth/calendar.events', 
    'https://www.googleapis.com/auth/calendar'
]
REDIRECT_URI = 'http://localhost:5001/auth/callback' 

# Helper to construct config from Env Vars
def get_client_config():
    return {
        "web": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "project_id": os.environ.get("GOOGLE_PROJECT_ID"),
            "auth_uri": os.environ.get("GOOGLE_AUTH_URI"),
            "token_uri": os.environ.get("GOOGLE_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.environ.get("GOOGLE_CERT_URL"),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
            "redirect_uris": [
                os.environ.get("GOOGLE_REDIRECT_URI_1"),
                os.environ.get("GOOGLE_REDIRECT_URI_2")
            ]
        }
    }

# Token persistence file
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_FILE = os.path.join(BACKEND_DIR, 'token.json')

@gmeet_bp.route("/auth/google", methods=['GET'])
def auth_google():
    try:
        # Check if critical env var exists
        if not os.environ.get("GOOGLE_CLIENT_ID"):
             return jsonify({"error": "Configuration Error: Env vars missing. Please check .env file."}), 500

        client_config = get_client_config()
        
        flow = Flow.from_client_config(
            client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent' 
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
        client_config = get_client_config()
        flow = Flow.from_client_config(
            client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        flow.fetch_token(code=code)
        creds = flow.credentials
        
        # SAVE CREDENTIALS TO FILE
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        
        # Redirect back to frontend
        return redirect("http://localhost:3000/doctor/dashboard") 
        
    except Exception as e:
        print(f"Auth Callback Error: {e}")
        return jsonify({"error": str(e)}), 500

@gmeet_bp.route("/create-meet", methods=['POST'])
def create_meet():
    creds = None
    
    # 1. Try to load from token.json
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        except Exception as e:
            print(f"Error loading token: {e}")
            # Continue to check failure

    # 2. Check validity
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                from google.auth.transport.requests import Request
                creds.refresh(Request())
                # Save refreshed token
                with open(TOKEN_FILE, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                print(f"Refresh failed: {e}")
                return jsonify({"error": "Session expired. Please Link Google Account again."}), 401
        else:
            return jsonify({"error": "User not authenticated. Please Link Google Account first."}), 401

    try:
        # Initialize Meet V2 Client with stored credentials
        client = meet_v2.SpacesServiceClient(credentials=creds)

        # Create Request for a new Meeting Space
        request_body = meet_v2.CreateSpaceRequest()
        
        # Call API
        response = client.create_space(request=request_body)

        return jsonify({"meetLink": response.meeting_uri})
        
    except Exception as e:
        print(f"Meet API Error: {e}")
        # Fallback to Calendar if Meet V2 fails (optional but good for robustness)
        return jsonify({"error": str(e)}), 500

