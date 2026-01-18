# Google Meet Integration Guide for CureBird

This guide details how to enable the **Real Google Meet** integration.

**Status**: The Python Backend logic (`gmeet.py`) and React Frontend connections are **ALREADY IMPLEMENTED**.

**Action Required**: You only need to provide the **`client_secret.json`** file from Google Cloud.

## Prerequisites

1.  **Google Cloud Platform (GCP) Account**.
2.  **Python Backend** (FastAPI) running.
3.  **Frontend** (React) running.

---

## Step 1: Google Cloud Setup

1.  **Create a Project**: Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (e.g., `curebird-telehealth`).
2.  **Enable API**:
    - Navigate to **APIs & Services > Library**.
    - Search for **Google Calendar API** and click **Enable**.
3.  **Configure OAuth Consent Screen**:
    - Go to **APIs & Services > OAuth consent screen**.
    - Select **External** (for testing) or **Internal** (if Google Workspace organization).
    - Fill in required details.
    - **Scopes**: Add `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar`.
    - **Test Users**: Add your email address (important for testing).
4.  **Create Credentials**:
    - Go to **APIs & Services > Credentials**.
    - Click **Create Credentials > OAuth client ID**.
    - **Application Type**: Web application.
    - **Authorized JavaScript origins**: `http://localhost:3000`
    - **Authorized redirect URIs**: `http://localhost:8000/auth/callback` (Backend URL).
    - **Download JSON**: Download the `client_secret_....json` file and rename it to `client_secret.json`. Place it in your `backend/` folder.

---

## Step 2: Backend Implementation (Python/FastAPI)

1.  **Install Libraries**:

    ```bash
    pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client fastapi uvicorn
    ```

2.  **Create `backend/gmeet.py`**:

    ```python
    from fastapi import APIRouter, Request
    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build
    import os

    router = APIRouter()

    # Allow non-HTTPS for local dev
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    CLIENT_SECRETS_FILE = "client_secret.json"
    SCOPES = ['https://www.googleapis.com/auth/calendar.events']
    REDIRECT_URI = 'http://localhost:8000/auth/callback'

    @router.get("/auth/google")
    def auth_google():
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return {"url": authorization_url}

    @router.get("/auth/callback")
    def auth_callback(code: str):
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # In a real app, save 'credentials.to_json()' to your Database linked to the Doctor's ID
        # For this demo, we can store it in a global variable or session (Simplified)
        global global_creds
        global_creds = credentials

        return {"message": "Authentication successful! You can now create meetings."}

    @router.post("/create-meet")
    def create_meet():
        if 'global_creds' not in globals():
             return {"error": "User not authenticated. Go to /auth/google first."}

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

        return {"meetLink": event.get('hangoutLink')}
    ```

3.  **Integrate in `backend/main.py`**:

    ```python
    from fastapi import FastAPI
    from gmeet import router as gmeet_router

    app = FastAPI()
    app.include_router(gmeet_router)
    ```

---

## Step 3: Frontend Implementation (React)

Update `src/Doctor/ConsultationWorkflow.jsx`:

1.  **Check Auth**:
    In `DoctorProfile.jsx`, add a button to link account:

    ```javascript
    const linkGoogle = async () => {
      const res = await fetch("http://localhost:8000/auth/google");
      const data = await res.json();
      window.location.href = data.url; // Redirects doctor to sign in
    };
    ```

2.  **Create Meeting**:
    In `ConsultationWorkflow.jsx`, replace `createCall` with:

    ```javascript
    const createCall = async () => {
      setIsCreatingMeet(true);
      try {
        const res = await fetch("http://localhost:8000/create-meet", {
          method: "POST",
        });
        const data = await res.json();

        if (data.meetLink) {
          setMeetLink(data.meetLink);
          // Optional: Open immediately
          // window.open(data.meetLink, '_blank');
        } else {
          alert("Error: " + (data.error || "Could not create meeting"));
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to backend.");
      } finally {
        setIsCreatingMeet(false);
      }
    };
    ```

## Summary

Once set up:

1.  Doctor clicks **"Link Google Account"** (Once).
2.  Backend stores credentials.
3.  Doctor clicks **"Create Google Meet Room"**.
4.  Frontend calls Backend -> Backend calls Google API -> Returns `meet.google.com/xyz` link.
5.  Link displays in your nicely styled HUD.
