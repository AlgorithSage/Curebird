from flask import Blueprint, jsonify, request
import traceback
from gemini_service import get_health_assistant

app = Blueprint('health_routes', __name__)

from . import services
import traceback
import sys
import os


# Add parent directory to path to import gemini_service
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from gemini_service import get_health_assistant

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
            # Step 1: Perform OCR
            extracted_text = services.perform_ocr(file.stream)
            
            # Step 2: Analyze the text
            analysis_results = services.analyze_report_text(extracted_text)
            
            return jsonify({
                "raw_text": extracted_text,
                "analysis": analysis_results
            })
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An error occurred during analysis: {e}"}), 500


# Health Assistant AI Endpoints
@app.route('/api/health-assistant/chat', methods=['POST'])
def health_assistant_chat():
    """Handle chat messages to Health Assistant AI."""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        conversation_id = data.get('conversation_id')
        
        # Get health assistant instance
        assistant = get_health_assistant()
        
        # Generate response
        result = assistant.generate_response(user_message, conversation_id)
        
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
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
