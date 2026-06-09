from flask import Blueprint, jsonify, request
import traceback
import re
from gemini_service import get_health_assistant as get_gemini_assistant

app = Blueprint('health_routes', __name__)

from . import services
import traceback
import sys
import os
import time
import requests as http_requests
from datetime import datetime

# ── News API helpers ──────────────────────────────────────────────────────────

_news_cache = {'data': None, 'ts': 0}
_NEWS_TTL = 1800  # 30 min

# Startup validation: warn if News API key is missing
_news_api_key_present = bool(os.getenv('News_API_key') or os.getenv('NEWS_API_KEY'))
if not _news_api_key_present:
    print('[⚠ NEWS] NEWS_API_KEY not found in environment — /api/health-news will return 500')

_CITY_COORDS = {
    'new delhi': [28.61, 77.21], 'delhi': [28.61, 77.21],
    'mumbai': [19.08, 72.88],   'bombay': [19.08, 72.88],
    'bengaluru': [12.97, 77.59],'bangalore': [12.97, 77.59],
    'chennai': [13.08, 80.27],  'madras': [13.08, 80.27],
    'kolkata': [22.57, 88.36],  'calcutta': [22.57, 88.36],
    'hyderabad': [17.39, 78.49],
    'pune': [18.52, 73.86],
    'ahmedabad': [23.02, 72.57],
    'jaipur': [26.91, 75.79],
    'lucknow': [26.85, 80.95],
    'kerala': [10.85, 76.27],   'kochi': [9.93, 76.26],
    'karnataka': [15.32, 75.71],
    'tamil nadu': [11.13, 78.66],
    'gujarat': [22.26, 71.19],
    'rajasthan': [27.02, 74.22],
}
_DEFAULT_LOCS = [
    [28.61, 77.21], [19.08, 72.88], [12.97, 77.59],
    [13.08, 80.27], [22.57, 88.36], [17.39, 78.49],
]
_CAT_KW = {
    'ALERT':    ['dengue','malaria','outbreak','surge','emergency','warning','alert','epidemic','virus','infection','spike'],
    'POLICY':   ['ayushman','budget','scheme','ministry','policy','government','regulation','bill','coverage','insurance','niti'],
    'RESEARCH': ['study','research','trial','artificial intelligence',' ai ','technology','innovation','icmr','findings','deployed','clinical'],
    'UPDATE':   ['who','milestone','achievement','reduction','improvement','progress','target','goal','commend'],
}
_URGENT_KW  = ['emergency','urgent','surge','outbreak','alert','critical','spike','epidemic','warning']
_HEALTH_TAGS = {
    'dengue':'Dengue','malaria':'Malaria','covid':'COVID-19','cancer':'Cancer',
    'diabetes':'Diabetes','tuberculosis':'Tuberculosis',' tb ':'Tuberculosis',
    'cholera':'Cholera','zika':'Zika','mpox':'Mpox','vaccine':'Vaccine',
    'vaccination':'Vaccine','mental health':'Mental Health','ayushman':'Ayushman',
    'budget':'Budget','research':'Research','outbreak':'Outbreak',
    'monsoon':'Monsoon','who':'WHO','icmr':'ICMR','hospital':'Hospital',
}

def _categorize(text):
    t = text.lower()
    for cat, kws in _CAT_KW.items():
        if any(k in t for k in kws):
            return cat
    return 'UPDATE'

def _detect_location(text, idx):
    t = text.lower()
    for city, coords in _CITY_COORDS.items():
        if city in t:
            return coords
    return _DEFAULT_LOCS[idx % len(_DEFAULT_LOCS)]

def _is_urgent(text):
    t = text.lower()
    return any(k in t for k in _URGENT_KW)

def _short_pin(title, max_len=30):
    words = title.split()[:6]
    pin = ' '.join(words)
    return pin[:max_len - 1] + '…' if len(pin) > max_len else pin

def _fmt_date(dt_str):
    try:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        day = str(dt.day)
        return dt.strftime(f'%b {day}, %Y')
    except Exception:
        return (dt_str or '')[:10]

def _extract_tags(title, desc):
    combined = (title + ' ' + (desc or '')).lower()
    tags = []
    for kw, tag in _HEALTH_TAGS.items():
        if kw in combined and tag not in tags:
            tags.append(tag)
        if len(tags) >= 3:
            break
    return tags or ['Health', 'India']


# Add parent directory to path to import groq_service
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from groq_service import get_health_assistant
from patient_chat_service import get_patient_service
from cerebras_service import generate_medical_summary

@app.route('/api/generate-summary', methods=['POST'])
def generate_summary_route():
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        file_urls = data.get('file_urls', [])
        
        if not texts and not file_urls:
            return jsonify({'summary': "No content to summarize."})
            
        summary = generate_medical_summary(texts, file_urls=file_urls)
        return jsonify({'summary': summary})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/disease-trends', methods=['GET'])
def get_disease_trends():
    try:
        trends = services.get_trends_data()
        return jsonify(trends)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {e}"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An error occurred during analysis: {e}"}), 500

@app.route('/api/analyze-report', methods=['POST'])
def analyze_report():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected for uploading"}), 400

        if file:
            # Clinical Analysis using Groq VLM via GroqHealthAssistant
            assistant = get_health_assistant()
            analysis_results = assistant.analyze_clinical_document(file.stream)
            
            return jsonify(analysis_results)
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An error occurred during analysis: {e}"}), 500

@app.route('/api/analyzer/process', methods=['POST'])
def process_analyzer_report():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected for uploading"}), 400

        if file:
            # Step: Comprehensive Analysis (Extraction + Summary)
            results = services.analyze_comprehensive(file.stream)
            
            return jsonify(results)
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An error occurred during comprehensive analysis: {e}"}), 500

@app.route('/api/resource-distribution', methods=['GET'])
def get_resource_distribution():
    try:
        import json
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'resource_distribution.json')
        with open(file_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        print(f"Error loading resource data: {e}")
        return jsonify({"error": "Data unavailable"}), 500


# Cure AI Endpoints
@app.route('/api/health-assistant/chat', methods=['POST'])
def health_assistant_chat():
    """Handle chat messages to Health Assistant AI."""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        conversation_id = data.get('conversation_id')
        medical_context = data.get('medicalContext')
        
        # Get health assistant instance
        assistant = get_health_assistant()
        
        # Generate response
        result = assistant.generate_response(user_message, conversation_id, medical_context)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Health Assistant Error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'response': 'I apologize, but I encountered an error. Please try again.'
        }), 500

@app.route('/api/health-assistant/context', methods=['GET'])
def health_assistant_context():
    """Get current disease trends context."""
    try:
        assistant = get_health_assistant()
        result = assistant.get_disease_context()
        return jsonify(result)
    
    except Exception as e:
        print(f"Context Error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health-assistant/clear', methods=['POST'])
def clear_conversation():
    """Clear conversation history."""
    try:
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        
        if not conversation_id:
            return jsonify({'error': 'conversation_id is required'}), 400
        
        assistant = get_health_assistant()
        success = assistant.clear_conversation(conversation_id)
        
        return jsonify({'success': success})
    
    except Exception as e:
        print(f"Clear Conversation Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/patient-reply', methods=['POST'])
def patient_chat_reply():
    """Generate an AI reply for the patient persona."""
    try:
        data = request.get_json()
        history = data.get('history', [])
        patient_context = data.get('patientContext', {})
        
        service = get_patient_service()
        reply = service.generate_patient_reply(history, patient_context)
        
        return jsonify({'reply': reply})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/disease-insight', methods=['POST'])
def get_disease_insight():
    """Generate AI insight for disease metrics."""
    try:
        data = request.get_json()
        disease = data.get('disease')
        metrics = data.get('metrics')
        
        if not disease or not metrics:
            return jsonify({'error': 'Missing disease or metrics data'}), 400
            
        assistant = get_health_assistant()
        result = assistant.analyze_disease_progress(disease.get('name'), metrics)
        
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def _is_indian_article(title, desc, source_name):
    combined = f"{title} {desc or ''} {source_name or ''}".lower()
    
    # Match India, Indian, Bharat with word boundaries to avoid matching Indiana
    if re.search(r'\b(india|indian|bharat)\b', combined):
        return True
    
    # Check major cities/states from _CITY_COORDS
    for place in _CITY_COORDS.keys():
        if re.search(rf'\b{re.escape(place)}\b', combined):
            return True
            
    # Check other Indian states/keywords
    indian_keywords = [
        'maharashtra', 'uttar pradesh', 'bihar', 'punjab', 'haryana', 
        'assam', 'odisha', 'madhya pradesh', 'telangana', 'andhra pradesh', 
        'goa', 'kashmir', 'himachal', 'uttarakhand', 'jharkhand', 
        'chhattisgarh', 'sikkim', 'manipur', 'meghalaya', 'mizoram', 
        'nagaland', 'tripura', 'arunachal'
    ]
    for kw in indian_keywords:
        if re.search(rf'\b{re.escape(kw)}\b', combined):
            return True
            
    return False
def _is_health_article(title, desc):
    combined = f"{title} {desc or ''}".lower()
    health_keywords = [
        'health', 'healthcare', 'disease', 'hospital', 'medical', 'medicine', 
        'vaccine', 'vaccination', 'outbreak', 'virus', 'infection', 'patient', 
        'doctor', 'clinical', 'drug', 'treatment', 'pharma', 'epidemic', 
        'pandemic', 'illness', 'dengue', 'malaria', 'covid', 'cancer', 
        'diabetes', 'tuberculosis', 'cholera', 'zika', 'mpox', 'surgeon', 
        'cardiac', 'hiv', 'aids', 'pathogen', 'fda', 'icmr', 'who', 
        'ayushman', 'hygiene', 'sanitation', 'pediatric', 'nursing', 'nurse', 
        'physician', 'clinic', 'flu', 'fever', 'symptoms', 'diagnose', 
        'diagnosis', 'antibiotic', 'allergy', 'asthma', 'mental', 'nutrition', 
        'vitamin', 'diet', 'covid-19', 'h5n1', 'h1n1', 'heart', 'brain', 
        'lung', 'stroke', 'wellness', 'pfizer', 'moderna', 'astrazeneca', 
        'covaxin', 'covishield', 'surgery', 'surgical', 'therapy', 'therapeutic', 
        'infectious', 'epidemiology', 'pathology', 'sleep', 'fitness', 
        'exercise', 'workout', 'obesity', 'overweight', 'calorie', 'calories', 
        'injury', 'injuries', 'pain', 'aches', 'kidney', 'liver', 'kidneys', 
        'stomach', 'intestinal', 'digestive', 'digestion', 'nutritionist', 
        'medicinal', 'pulse', 'blood', 'anatomy', 'hygienic', 'immune', 
        'immunity', 'vaccines', 'medicines', 'hospitals', 'doctors', 'patients',
        'diseases', 'viruses', 'infections', 'clinics', 'symptom', 'therapies',
        'telemedicine', 'biomedicine', 'ehealth', 'mhealth', 'healthtech'
    ]
    for kw in health_keywords:
        if re.search(rf'\b{re.escape(kw)}\b', combined):
            return True
    return False


@app.route('/api/health-news', methods=['GET'])
def get_health_news():
    """Fetch & cache India health news from News API."""
    global _news_cache
    if _news_cache['data'] and (time.time() - _news_cache['ts']) < _NEWS_TTL:
        return jsonify(_news_cache['data'])

    api_key = os.getenv('News_API_key') or os.getenv('NEWS_API_KEY')
    if not api_key:
        return jsonify({'error': 'NEWS_API_KEY not configured'}), 500

    raw_headlines = []
    try:
        r = http_requests.get(
            'https://newsapi.org/v2/top-headlines',
            params={'country': 'in', 'category': 'health', 'pageSize': 15, 'apiKey': api_key},
            timeout=10,
        )
        if r.status_code == 200:
            raw_headlines = r.json().get('articles', [])
    except Exception as e:
        print(f"[NewsAPI] top-headlines error: {e}")

    raw_everything = []
    try:
        r2 = http_requests.get(
            'https://newsapi.org/v2/everything',
            params={
                'q': 'India AND (health OR disease OR hospital OR medicine OR vaccine OR outbreak)',
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': 20,
                'apiKey': api_key,
            },
            timeout=10,
        )
        if r2.status_code == 200:
            raw_everything = r2.json().get('articles', [])
    except Exception as e:
        print(f"[NewsAPI] everything error: {e}")

    if not raw_headlines and not raw_everything:
        return jsonify({'error': 'No articles fetched from News API'}), 502

    # Deduplicate and filter
    seen, unique = set(), []
    
    # 1. Process top headlines (guaranteed Indian, since country='in')
    for a in raw_headlines:
        t = a.get('title') or ''
        desc = a.get('description') or ''
        if t and t not in seen:
            if _is_health_article(t, desc):
                seen.add(t)
                unique.append(a)
            
    # 2. Process everything search results, filtering for Indian context & health context
    for a in raw_everything:
        t = a.get('title') or ''
        desc = a.get('description') or ''
        src = (a.get('source') or {}).get('name') or ''
        if t and t not in seen:
            if _is_health_article(t, desc) and _is_indian_article(t, desc, src):
                seen.add(t)
                unique.append(a)

    # Normalise to frontend schema
    articles = []
    for idx, a in enumerate(unique[:12]):
        title = (a.get('title') or '').strip()
        desc  = (a.get('description') or '').strip()
        combined = title + ' ' + desc
        cat = _categorize(combined)
        articles.append({
            'id':        str(idx + 1),
            'category':  cat,
            'headline':  title,
            'excerpt':   desc,
            'source':    (a.get('source') or {}).get('name', 'Unknown'),
            'date':      _fmt_date(a.get('publishedAt', '')),
            'tags':      _extract_tags(title, desc),
            'location':  _detect_location(combined, idx),
            'urgent':    _is_urgent(combined),
            'url':       a.get('url', ''),
            'imageUrl':  a.get('urlToImage', '') or '',
        })

    ticker = [f"{n['category']}: {n['headline']}" for n in articles[:8]]
    result = {'articles': articles, 'ticker': ticker}
    _news_cache = {'data': result, 'ts': time.time()}
    return jsonify(result)



