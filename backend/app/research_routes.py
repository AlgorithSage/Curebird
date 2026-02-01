from flask import Blueprint, jsonify, request
import uuid
import datetime
import random

research_bp = Blueprint('research_routes', __name__)

# Mock Data for Data Explorer
MOCK_DATASET = [
    {"id": "rec_001", "age_bucket": "40-45", "gender": "M", "region": "Maharashtra", "disease": "Diabetes Type 2", "hba1c": 7.2, "bmi": 28.4},
    {"id": "rec_002", "age_bucket": "30-35", "gender": "F", "region": "Kerala", "disease": "Hypertension", "bp_systolic": 140, "bp_diastolic": 90},
    {"id": "rec_003", "age_bucket": "55-60", "gender": "M", "region": "Delhi", "disease": "COPD", "fev1": 2.1, "smoking_status": "Former"},
    {"id": "rec_004", "age_bucket": "25-30", "gender": "F", "region": "Karnataka", "disease": "Asthma", "fev1": 3.4, "smoking_status": "Never"},
    {"id": "rec_005", "age_bucket": "65-70", "gender": "M", "region": "Tamil Nadu", "disease": "Diabetes Type 2", "hba1c": 8.1, "bmi": 30.2},
]

# Mock Models
MOCK_MODELS = [
    {
        "id": "diabetes_risk_v2",
        "name": "Diabetes Risk Predictor",
        "version": "2.1.0",
        "type": "Classification",
        "description": "Predicts 5-year diabetes risk based on clinical parameters.",
        "accuracy": "92%",
        "framework": "Scikit-learn"
    },
    {
        "id": "cvd_predict_v1",
        "name": "Cardiovascular Event Predictor",
        "version": "1.0.4",
        "type": "Probabilistic",
        "description": "Estimates 10-year risk of major cardiac events.",
        "accuracy": "89%",
        "framework": "PyTorch"
    },
    {
        "id": "lung_health_v3",
        "name": "Lung Health Analyzer",
        "version": "3.2.1",
        "type": "Image Analysis",
        "description": "Analyzes X-ray patterns for early signs of COPD.",
        "accuracy": "94%",
        "framework": "TensorFlow"
    }
]

@research_bp.route('/api/v1/data/query', methods=['POST'])
def query_data():
    """
    Mock endpoint for querying anonymized data.
    """
    try:
        data = request.get_json()
        filters = data.get('filters', {})
        
        # Simple filtering logic
        results = MOCK_DATASET
        if filters.get('region'):
            results = [r for r in results if r['region'] == filters['region']]
        if filters.get('disease'):
            results = [r for r in results if filters['disease'].lower() in r['disease'].lower()]
            
        return jsonify({
            "query_id": str(uuid.uuid4()),
            "status": "completed",
            "count": len(results),
            "results": results,
            "download_url": "#"  # Mock URL
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@research_bp.route('/api/v1/models', methods=['GET'])
def list_models():
    """
    List available ML models.
    """
    return jsonify(MOCK_MODELS)

@research_bp.route('/api/v1/models/<model_id>/predict', methods=['POST'])
def run_model_inference(model_id):
    """
    Mock endpoint for running model inference.
    """
    try:
        input_data = request.get_json().get('input_data', {})
        
        # Mock Logic based on model_id
        if model_id == 'diabetes_risk_v2':
            # Simple mock logic: Risk increases with age and BMI
            risk_score = 0.1
            if int(input_data.get('age', 30)) > 45: risk_score += 0.3
            if float(input_data.get('bmi', 20)) > 25: risk_score += 0.2
            if int(input_data.get('fasting_glucose', 90)) > 110: risk_score += 0.3
            
            risk_category = "High" if risk_score > 0.6 else "Moderate" if risk_score > 0.3 else "Low"
            
            return jsonify({
                "model_id": model_id,
                "prediction": {
                    "risk_score": round(min(risk_score, 0.99), 2),
                    "risk_category": risk_category,
                    "confidence": 0.89
                },
                "explanation": {
                    "top_factors": [
                        {"feature": "fasting_glucose", "contribution": 0.32},
                        {"feature": "age", "contribution": 0.22}
                    ]
                }
            })
        
        return jsonify({
            "model_id": model_id,
            "prediction": {
                "risk_score": 0.45,
                "risk_category": "Moderate",
                "confidence": 0.85
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
