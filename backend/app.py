from flask import Flask, jsonify, request
import requests
import pandas as pd
from flask_cors import CORS
import traceback
from groq_service import get_health_assistant

app = Flask(__name__)
CORS(app)

import os
DATA_GOV_API_KEY = os.getenv('DATA_GOV_API_KEY')
DATA_API_URL = f"https://api.data.gov.in/resource/96973b30-3829-46c4-912b-ab7ec65aff1b?api-key={DATA_GOV_API_KEY}&format=json&limit=1000"

@app.route('/api/disease-trends', methods=['GET'])
def get_disease_trends():
    try:
        response = requests.get(DATA_API_URL)
        response.raise_for_status()
        raw_data = response.json()
        
        records = raw_data.get('records', [])
        if not records:
            return jsonify({"error": "No records found"}), 404

        df = pd.DataFrame(records)
        
        # --- FIX: Analyze by the correct column 'disease_disease_condition' ---
        # Also, convert 'nos_of_outbreaks' to a number to sum them up
        df['nos_of_outbreaks'] = pd.to_numeric(df['nos_of_outbreaks'])
        
        # Group by disease and sum the outbreaks for each disease
        disease_counts = df.groupby('disease_disease_condition')['nos_of_outbreaks'].sum().reset_index()
        disease_counts.columns = ['disease', 'outbreaks']
        
        # Sort by the number of outbreaks in descending order
        disease_counts = disease_counts.sort_values(by='outbreaks', ascending=False)
        
        trends = disease_counts.to_dict(orient='records')
        
        return jsonify(trends)

    except Exception as e:
        print("--- GENERAL ERROR ---")
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {e}"}), 500

from services.openfda_service import get_medicines_for_disease

@app.route('/api/resource-distribution', methods=['GET'])
def get_resource_distribution():
    try:
        import json
        import os
        file_path = os.path.join(os.path.dirname(__file__), 'resource_distribution.json')
        with open(file_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        print(f"Error loading resource data: {e}")
        return jsonify({"error": "Data unavailable"}), 500

@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    disease = request.args.get('disease')
    if not disease:
        return jsonify({"error": "Disease parameter is required"}), 400
    
    medicines = get_medicines_for_disease(disease)
    return jsonify({"medicines": medicines})


if __name__ == '__main__':
    app.run(debug=True, port=5001)

# Trigger reload
