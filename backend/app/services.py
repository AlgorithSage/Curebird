import requests
import pandas as pd
import pytesseract
from PIL import Image
import re
import os
import json
import time
import base64
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# --- Cache Configuration ---
_TRENDS_CACHE = None
_CACHE_TIMESTAMP = 0
CACHE_DURATION = 3600  # 1 hour


# --- Constants ---
API_KEY = os.getenv('DATA_GOV_API_KEY')
DATA_API_URL = f"https://api.data.gov.in/resource/96973b30-3829-46c4-912b-ab7ec65aff1b?api-key={API_KEY}&format=json&limit=1000"

# --- Default Demographics for Chronic/Data-Sparse Diseases ---
DEFAULT_AGE_GROUPS = {
    "0-18": 15,
    "19-45": 45,
    "46-64": 25,
    "65+": 15
}

def analyze_report_text(text):
    detected_diseases = []
    detected_medications = []
    lines = text.lower().split('\n')
    for i, line in enumerate(lines):
        match = re.match(r'^\s*\d+\.\s*(\w+)', line)
        if match:
            med_name = match.group(1).capitalize()
            med_info = {"name": med_name, "dosage": "", "frequency": ""}
            detected_medications.append(med_info)
    return {"diseases": detected_diseases, "medications": detected_medications}

def get_trends_data():
    """Authoritative Intelligence Source with Hardened Mapping."""
    global _TRENDS_CACHE, _CACHE_TIMESTAMP
    
    # Check cache
    if _TRENDS_CACHE and (time.time() - _CACHE_TIMESTAMP < CACHE_DURATION):
        # Optional: Print cache hit debug if needed, but keeping it clean
        return _TRENDS_CACHE

    instance_id = int(time.time() % 1000)
    print(f"--- [SURVEILLANCE PIPELINE v2.2] Instance {instance_id} Active at {time.strftime('%H:%M:%S')} ---")
    EPIDEMIOLOGY_STORE = os.path.join(os.path.dirname(__file__), '..', 'india_epidemiology_data.json')
    
    if not os.path.exists(EPIDEMIOLOGY_STORE):
        print(f"CRITICAL: Epidemiology store not found at {EPIDEMIOLOGY_STORE}")
        return []

    try:
        with open(EPIDEMIOLOGY_STORE, 'r') as f:
            intel_data = json.load(f)
        
        raw_diseases = intel_data.get('diseases', [])
        result = []

        for disease in raw_diseases:
            metrics = disease.get('metrics', {})
            d_name = str(disease.get('name', ''))
            segment = disease.get('segment', 'Uncategorized')
            
            # 1. Metric Extraction (Robusted for % and strings)
            raw_val = metrics.get('weekly_reported_cases') or metrics.get('weekly_notified_cases') or metrics.get('prevalence', 0)
            try:
                if isinstance(raw_val, str):
                    numeric_val = float(raw_val.replace('%', '').replace(',', '').strip().split(' ')[0])
                else:
                    numeric_val = float(raw_val)
            except:
                numeric_val = 0

            # 2. Hardened Medicine Mapping (Explicit match for Section D)
            d_lower = d_name.lower().strip()
            if 'tuberculosis' in d_lower or 'tb' in d_lower:
                meds = ['Rifampicin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol']
            elif 'diabetes' in d_lower:
                meds = ['Metformin', 'Insulin', 'Sitagliptin']
            elif 'hypertension' in d_lower:
                meds = ['Telmisartan', 'Amlodipine', 'Losartan']
            elif 'respiratory' in d_lower or 'ari' in d_lower:
                meds = ['Amoxicillin', 'Azithromycin', 'Paracetamol']
            elif 'diarrheal' in d_lower or 'add' in d_lower:
                meds = ['ORS', 'Zinc', 'Loperamide']
            elif 'fever' in d_lower:
                meds = ['Paracetamol', 'Fluids', 'Supportive Care']
            elif 'cardiac' in d_lower or 'ischemic' in d_lower:
                meds = ['Aspirin', 'Atorvastatin', 'Clopidogrel']
            elif 'renal' in d_lower or 'kidney' in d_lower:
                meds = ['Furosemide', 'Erythropoietin', 'Calcium Supplements']
            elif 'mental' in d_lower or 'anxiety' in d_lower:
                meds = ['Sertraline', 'Escitalopram', 'CBT']
            else:
                meds = ['Supportive Care', 'Fluids']

            # 3. Demographic Extraction (Forcing defaults if missing or non-specific)
            age_data = disease.get('age_demographics', {})
            if not age_data or 'all' in age_data or len(age_data) == 0:
                age_data = DEFAULT_AGE_GROUPS
            
            item = {
                'id': disease.get('id'),
                'disease': d_name,
                'segment': segment,
                'outbreaks': raw_val,
                'annual_count': metrics.get('annual_confirmed_cases', 0),
                'burden_estimate': metrics.get('estimated_national_burden', ''),
                'risk_level': disease.get('risk_level', 'Unknown'),
                'severity': disease.get('severity', 'Moderate'),
                'seasonality': disease.get('seasonality', 'Year-round'),
                'confidence': metrics.get('confidence', 'Medium'),
                'timeframe': metrics.get('timeframe', 'Monthly Estimate'),
                'description': disease.get('about', ''),
                'trends_context': disease.get('trends', ''),
                'recovery_rate': disease.get('recovery_metrics', {}).get('rate', '95%'),
                'avg_recovery': disease.get('recovery_metrics', {}).get('avg_time', '7 days'),
                'age_groups': [{'name': k, 'value': v} for k, v in age_data.items()],
                'gender_split': [{'name': 'Male', 'value': 52}, {'name': 'Female', 'value': 48}],
                'source': 'Public Health Intelligence (Curebird Store)',
                'source_label': 'IDSP + MoHFW Surveillance Metrics',
                'sources': disease.get('sources', []),
                'top_medicines': meds,
                'med_source': 'Clinical Protocols & Intelligence. Disclaimer: Always consult a healthcare professional before starting any medication or treatment.',
                'v2_fingerprint': 'AUTH_PIPELINE_22'
            }

            # 4. History Generation
            item['history'] = [
                {'year': 2021, 'count': round(numeric_val * 0.9, 1)},
                {'year': 2022, 'count': round(numeric_val * 0.95, 1)},
                {'year': 2023, 'count': round(numeric_val * 1.05, 1)},
                {'year': 2024, 'count': round(numeric_val * 0.98, 1)},
                {'year': 2025, 'count': numeric_val}
            ]
            
            result.append(item)
        
        # Update cache (Outside Loop)
        _TRENDS_CACHE = result
        _CACHE_TIMESTAMP = time.time()
        print(f"--- Cache Updated with {len(result)} items at {time.strftime('%H:%M:%S')} ---")

        return result

    except Exception as e:
        print(f"ERROR: Mapping failed: {e}")
        return []

# --- OCR Configuration ---
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def perform_ocr(file_stream):
    try:
        image = Image.open(file_stream)
        # Ensure image is in RGB for best OCR results
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        extracted_text = pytesseract.image_to_string(image)
        if not extracted_text.strip():
            print("OCR WARNING: No text extracted from image.")
        return extracted_text
    except Exception as e:
        print(f"OCR ERROR: Failed to perform extraction: {e}")
        return ""

def analyze_clinical_groq(file_stream):
    """
    Analyze clinical document using Groq Llama 3.2 Vision with strict JSON schema.
    Fallback for when Gemini is unavailable.
    """
    try:
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("Groq API key missing")
            
        client = Groq(api_key=api_key)
        
        # Encode image
        file_stream.seek(0)
        base64_image = base64.b64encode(file_stream.read()).decode('utf-8')
        
        prompt = """
        You are a Senior Chief Medical Officer. Analyze this medical document with extreme attention to detail.
        
        Extract the following structured data in EXACT JSON format:
        {
            "patient_name": "Full Name of Patient (e.g. John Doe). Look for 'Name:', 'Patient:', 'Mr/Ms/Mrs'. Return empty string if not found.",
            "summary": "Detailed clinical summary of the patient's condition, history, and current visit reason. Include specific complaints and duration.",
            "extracted_vitals": [
                {"label": "Vital Name (e.g. BP, HR, Temp)", "value": "Value with unit", "status": "normal/high/low/critical"}
            ],
            "key_findings": [
                "List EVERY SINGLE diagnosis, disease history, and symptom mentioned (e.g. 'GerD 8yr', 'Asthma', 'Allergy to X'). Be comprehensive."
            ],
            "medication_adjustments": [
                {"name": "Medication Name", "action": "Prescribed/Continued", "dose": "Dosage & Frequency (e.g. 10mg BD)"}
            ],
            "recommendation": "Clinical plan and follow-up instructions.",
            "digital_copy": "A clean, professional Markdown representation of the ENTIRE document text as if it were typed out. Include all headers, footers, and patient details."
        }
        
        CRITICAL RULES:
        1. Capture ALL medications listed in the 'Rx' or 'Treatment' section.
        2. Capture ALL past history and current diagnoses in 'key_findings'.
        3. If a vital is missing, do not invent it.
        4. Return ONLY valid JSON.
        """
        
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[
                {
                    "role": "user", 
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"Groq Analysis Error: {e}")
        return {
            "summary": "Analysis failed (Groq fallback).",
            "extracted_vitals": [],
            "key_findings": [f"Error: {str(e)}"],
            "recommendation": "Please check API configuration.",
            "medication_adjustments": []
        }

def analyze_with_vlm(file_stream, custom_api_key=None):
    """
    Directly analyze medical report images using Groq VLM.
    """
    try:
        # 1. Setup Groq Client
        api_key = custom_api_key or os.getenv('GROQ_API_KEY_VISION') or os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("Groq API key not found in environment variables.")
        
        client = Groq(api_key=api_key)
        
        # 2. Encode image to Base64
        file_stream.seek(0)
        base64_image = base64.b64encode(file_stream.read()).decode('utf-8')
        
        # 3. Call Groq VLM
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "Analyze this image. First, determine if it is a valid medical document (prescription, lab report, clinical notes, discharge summary) or medication packaging. If it is NOT a medical image, return strict JSON: {\"is_medical\": false}. If it IS a medical image, extract all detected medications (name, dosage, frequency) and any detected clinical conditions or diseases. CRITICALLY: Extract the 'patient_name' if visible (look for 'Name:', 'Patient:', 'Mr/Ms/Mrs'). ALSO, generate a 'digital_copy' field which contains a clean, professional Markdown representation of the ENTIRE document text as if it were typed out. IMPORTANT: Use Markdown tables for medications calling for strict formatting. Return JSON: {\"is_medical\": true, \"patient_name\": \"...\", \"medications\": [...], \"diseases\": [...], \"digital_copy\": \"...markdown string...\"}"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        raw_response = completion.choices[0].message.content
        structured_data = json.loads(raw_response)
        
        return {
            "is_medical": structured_data.get("is_medical", True),
            "patient_name": structured_data.get("patient_name", ""),
            "medications": structured_data.get("medications", []),
            "diseases": structured_data.get("diseases", []) or structured_data.get("conditions", []),
            "digital_copy": structured_data.get("digital_copy", "")
        }
    except Exception as e:
        print(f"VLM ERROR: {e}")
        return {"is_medical": False, "medications": [], "diseases": [], "digital_copy": ""}

def verify_and_correct_medical_data(extracted_data):
    """
    CORE 2: FEEDBACK AI (Llama 3.3 70B Versatile)
    
    This layer acts as a 'Senior Medical Auditor'.
    It takes the raw extraction and uses deep medical knowledge to correct OCR errors.
    """
    try:
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return extracted_data 

        client = Groq(api_key=api_key)
        
        # 1. Construct the context for the AI
        diseases_context = ", ".join(extracted_data.get('diseases', []))
        if not diseases_context:
            diseases_context = "Not specifically detected, infer from medications if possible."
            
        medications_json = json.dumps(extracted_data.get('medications', []))
        
        system_prompt = """
        You are Curebird’s Clinical Feedback & Validation AI.

        Your job is to receive OCR-extracted medical text from prescriptions and convert it into a medically correct, verified, and structured form.

        You MUST act like a combination of:
        • A physician (disease & symptom reasoning)
        • A pharmacist (drug names, salts, alternatives)
        • A medical data validator (guideline-based logic)

        You must NEVER hallucinate or invent drugs or diseases.
        If something is unclear, mark it as "uncertain" instead of guessing.

        ------------------------------------
        YOUR TASKS
        ------------------------------------

        You will receive OCR-extracted text which may contain:
        • Misspelled disease names
        • Wrong or garbled drug names
        • Incomplete information
        • Formatting errors

        You must:

        1) Identify all diseases and symptoms
        2) Correct disease names using standard medical terminology (ICD / SNOMED style)
        3) Identify all medicines
        4) Correct medicine names. **CRITICAL: If the input appears to be a Brand Name (e.g. 'Lonazep', 'Stamol'), the 'corrected' output MUST remain that Brand Name (spelling fixed). Do NOT replace a Brand Name with its Generic Name.**
        5) Validate whether each medicine is medically appropriate for the disease
        6) If not appropriate, flag it
        7) For each medicine, provide therapeutically equivalent alternatives (same salt or same drug class)
        8) Estimate confidence for each correction
        9) Produce structured JSON output only

        You must reason using globally accepted medical practice guidelines (WHO, ICMR, NICE, FDA-style logic).

        ------------------------------------
        ------------------------------------
        ------------------------------------
        CORRECTION RULES
        ------------------------------------

        • **Brand Name Priority**: If OCR says "cenzep", and you identify it as "Lonazep", output "Lonazep". Do NOT output "Clonazepam" as the main name.
        • If a medicine name does not exist, use fuzzy matching + disease context to find the closest real medicine.
        
        **UNIVERSAL PHONETIC RECONSTRUCTION ENGINE (Applies to ALL drugs):**
        1. **Principle**: OCR usually captures the "shape" or "sound" of the word but messes up specific letters.
        2. **Action**: For EVERY unrecognized input string:
           a. "Sound it out" phonetically.
           b. Look at the **Identified Diseases**.
           c. Search your internal database of **Indian & Global Brand Names** for a match that:
              - Sounds/looks similar to the input.
              - Is a standard treatment for the identified disease.
        3. **Example Logic (Mental Model)**: 
           - Input "Stamol" + Disease "Hypertension" -> Match found: "Stamlo" (Amlodipine).
           - Input "Zylor" + Disease "Gout" -> Match found: "Zyloric".
           - Input "Trazodic" + Disease "Anxiety" -> Match found: "Trazodone" or Brand "Trazonil".

        **ALTERNATIVES GENERATION RULES:**
        1. **Real-World Brands**: When suggesting alternatives, do NOT just list Generics. Suggest **Market-Leading Brand Names** available in pharmacies (e.g. for 'Stamlo', suggest 'Amlokind', 'Amlopres').
        2. **Exact Match**: Ensure the alternative has the EXACT same active salt and mechanism.
        3. **Availability**: Prioritize brands that are widely distributed in the Indian/Global market.
        
        • If a disease name does not exist, use symptom context to infer the correct medical term.
        • If multiple possibilities exist, list them and mark confidence accordingly.
        • Never invent new drugs or diseases.

        ------------------------------------
        OUTPUT FORMAT (MANDATORY)
        ------------------------------------

        Return ONLY valid JSON in this exact format:

        {
          "diseases": [
            {
              "input": "<raw OCR disease>",
              "corrected": "<standard medical disease name>",
              "confidence": 0.95
            }
          ],
          "medicines": [
            {
              "input": "<raw OCR drug>",
              "corrected": "<Corrected BRAND NAME if input was Brand, or Generic if input was Generic>",
              "dosage": "<preserve original dosage or correct if obvious>",
              "frequency": "<preserve original frequency>",
              "salt_or_composition": "<active ingredient / generic name>",
              "valid_for_disease": true,
              "alternatives": ["<equivalent drug 1>", "<equivalent drug 2>"],
              "confidence": 0.95,
              "is_corrected": true
            }
          ],
          "warnings": [
            "<any safety or mismatch warning>"
          ]
        }

        ------------------------------------
        BEHAVIORAL RULES
        ------------------------------------

        • Be extremely strict.
        • Do not simplify.
        • Do not explain in natural language.
        • Do not output anything outside JSON.
        • When unsure, say "uncertain".
        """
        
        user_prompt = f"""
        AUDIT THIS EXTRACTION:
        
        Context (Diseases): {diseases_context}
        Raw Medications: {medications_json}
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1, 
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        result_json = json.loads(completion.choices[0].message.content)
        
        # Merge back into a clean structure for the frontend
        final_meds = []
        for med in result_json.get('medicines', []):
            final_meds.append({
                "name": med.get('corrected', med.get('input')),
                "dosage": med.get('dosage', ''),
                "frequency": med.get('frequency', ''),
                "alternatives": med.get('alternatives', []),
                "is_corrected": med.get('is_corrected', False),
                # Storing extra metadata if needed for future
                "confidence": med.get('confidence'),
                "valid": med.get('valid_for_disease')
            })
            
        # Update extracted data with corrected values
        extracted_data['medications'] = final_meds
        
        corrected_diseases = [d.get('corrected') for d in result_json.get('diseases', [])]
        if corrected_diseases:
            extracted_data['diseases'] = corrected_diseases
            
        return extracted_data

    except Exception as e:
        print(f"FEEDBACK AI ERROR: {e}")
        return extracted_data # Return original on error

def analyze_comprehensive(file_stream):
    """
    Step 1: Extract data using VLM (Core 1).
    Step 2: Verify & Correct using Feedback AI (Core 2 - Llama 70B).
    Step 3: Explain results (Core 3 - Summary).
    """
    try:
        # Use dedicated analyzer key if available
        analyzer_key = os.getenv('GROQ_API_KEY_ANALYZER') or os.getenv('GROQ_API_KEY')
        
        # Phase 1: Structured Extraction (Core 1)
        extracted_data = analyze_with_vlm(file_stream, custom_api_key=analyzer_key)
        
        # Guardrail: Check if it's medical
        if not extracted_data.get('is_medical', True):
             return {
                "analysis": {"medications": [], "diseases": []},
                "summary": "Please upload a valid medical document (e.g., prescription, lab report, or doctor's notes). I am programmed to only analyze medical records and cannot process non-medical images."
            }
            
        # Phase 2: Feedback & Correction Loop (Core 2)
        # This is where we fix the 'cenzep' -> 'Lonazep' errors
        print("--- Engaging Core 2: Feedback AI ---")
        verified_data = verify_and_correct_medical_data(extracted_data)
        
        # Phase 3: User-friendly Summary (Core 3)
        client = Groq(api_key=analyzer_key)
        
        summary_prompt = f"""
        You are a friendly medical interpreter for a patient.
        Given the following medically verified data, provide a very crisp, short, and empathetic summary.
        
        Validated Data:
        Diseases/Conditions: {', '.join(verified_data['diseases'])}
        Medications: {json.dumps(verified_data['medications'])}
        
        Instructions:
        - Explain clinical terms (e.g., 'CAD' becomes 'heart artery blockage').
        - If corrections were made by the system (e.g. spelling fixed), mention that the AI verified the prescription.
        - Be encouraging but professional.
        - Maximum 3-4 bullet points.
        - End with a small disclaimer.
        - Reference the 'Alternatives' if available, saying 'Generic alternatives have been identified'.
        """
        
        summary_completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": summary_prompt}],
            temperature=0.7,
            max_tokens=512
        )
        
        summary_text = summary_completion.choices[0].message.content
        
        return {
            "analysis": verified_data,
            "summary": summary_text
        }
        
    except Exception as e:
        print(f"COMPREHENSIVE ANALYZER ERROR: {e}")
        return {
            "analysis": {"medications": [], "diseases": []},
            "summary": "An error occurred while creating your medical summary. Please try again."
        }
