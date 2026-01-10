from flask import Blueprint, jsonify, request
import traceback
from gemini_service import get_health_assistant as get_gemini_assistant

app = Blueprint('health_routes', __name__)

from . import services
import traceback
import sys
import os


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

@app.route('/api/analyze-report', methods=['POST'])
def analyze_report():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected for uploading"}), 400

        if file:
            # Clinical Analysis using Groq Llama 3.2 (Fallback for Gemini)
            # assistant = get_gemini_assistant()
            # analysis_results = assistant.analyze_clinical_document(file.stream)
            
            analysis_results = services.analyze_clinical_groq(file.stream)
            
            # Add status field for frontend compatibility
            analysis_results['status'] = 'Complete'
            
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
