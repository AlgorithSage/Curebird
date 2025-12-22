import requests
import pandas as pd
import pytesseract
from PIL import Image
import re
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env
# services.py is in backend/app/, so .env is in parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# --- Constants ---
API_KEY = os.getenv('DATA_GOV_API_KEY')
if not API_KEY:
    print("Error: DATA_GOV_API_KEY not found in environment.")

DATA_API_URL = f"https://api.data.gov.in/resource/96973b30-3829-46c4-912b-ab7ec65aff1b?api-key={API_KEY}&format=json&limit=1000"
DISEASE_KEYWORDS = ['fever', 'cough', 'headache', 'infection', 'diabetes', 'hypertension', 'anemia', 'gastritis', 'bronchitis', 'pneumonia', 'fracture']

# --- Service Function 1: Analyze Report Text (UPGRADED) ---
def analyze_report_text(text):
    """
    An upgraded NLP function that understands multi-line context for prescriptions.
    """
    detected_diseases = []
    detected_medications = []
    lines = text.lower().split('\n')
    
    # --- Part 1: Disease Detection (simple keyword search) ---
    for line in lines:
        for disease in DISEASE_KEYWORDS:
            if disease in line and disease not in detected_diseases:
                detected_diseases.append(disease.capitalize())

    # --- Part 2: Medication Parsing (Context-aware) ---
    for i, line in enumerate(lines):
        # A medication often starts with a number, like "1. Acetaminophen"
        match = re.match(r'^\s*\d+\.\s*(\w+)', line)
        if match:
            med_name = match.group(1).capitalize()
            med_info = {"name": med_name, "dosage": "", "frequency": ""}
            
            # Now, look ahead in the next few lines for details
            lookahead_range = min(i + 4, len(lines)) # Check the next 3 lines
            for j in range(i + 1, lookahead_range):
                next_line = lines[j]
                if 'dosage:' in next_line:
                    med_info['dosage'] = next_line.split('dosage:')[1].strip()
                if 'frequency:' in next_line:
                    med_info['frequency'] = next_line.split('frequency:')[1].strip()

            detected_medications.append(med_info)

    return {"diseases": detected_diseases, "medications": detected_medications}

# --- Service Function 2: Get Disease Trends ---
# --- Service Function 2: Get Disease Trends (With Caching) ---
import json
import time
import os

CACHE_FILE = "disease_data_cache.json"
CACHE_DURATION = 86400  # 24 hours in seconds

def get_trends_data():
    """Fetches and processes disease trend data from the government API with robust caching."""
    
    # 1. Try to serve from cache if it is fresh (< 24 hrs)
    if os.path.exists(CACHE_FILE):
        file_age = time.time() - os.path.getmtime(CACHE_FILE)
        if file_age < CACHE_DURATION:
            try:
                with open(CACHE_FILE, 'r') as f:
                    print("Serving from fresh cache")
                    return json.load(f)
            except Exception as e:
                print(f"Error reading cache: {e}")

    # 2. Try the Live API
    try:
        print("Attempting to fetch live data from Government API...")
        response = requests.get(DATA_API_URL, timeout=10) # Added timeout
        response.raise_for_status()
        raw_data = response.json()
        
        records = raw_data.get('records', [])
        if not records:
            raise ValueError("API returned empty records")

        df = pd.DataFrame(records)
        df['nos_of_outbreaks'] = pd.to_numeric(df['nos_of_outbreaks'])
        disease_counts = df.groupby('disease_disease_condition')['nos_of_outbreaks'].sum().reset_index()
        disease_counts.columns = ['disease', 'outbreaks']
        disease_counts = disease_counts.sort_values(by='outbreaks', ascending=False)
        
        result = disease_counts.to_dict(orient='records')
        
        # Add source attribution
        for item in result:
            item['source'] = 'Government API (Live)'
        
        # Save to cache
        with open(CACHE_FILE, 'w') as f:
            json.dump(result, f)
            print("Updated cache with live API data")
            
        return result
        
    except Exception as e:
        print(f"API Failed: {e}. Falling back to Hybrid Archive.")
        # 3. Fallback: Serve the local 'Hybrid Archive' cache (even if old or manually created)
        if os.path.exists(CACHE_FILE):
             try:
                with open(CACHE_FILE, 'r') as f:
                    print("Serving from Hybrid Archive (Fallback)")
                    return json.load(f)
             except Exception as json_err:
                 print(f"Critical Cache Failure: {json_err}")
        
        # 4. Last Resort: Return empty list (prevents crash)
        return []

# --- Service Function 3: Perform OCR ---
def perform_ocr(file_stream):
    """Extracts text from an image file stream using Tesseract."""
    image = Image.open(file_stream)
    return pytesseract.image_to_string(image)

