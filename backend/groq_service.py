import os
import json
import time
import random
from groq import Groq, RateLimitError, APIError
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Load environment variables explicitly
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class GroqHealthAssistant:
    def __init__(self):
        """Initialize Groq for health assistance."""
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.client = Groq(api_key=api_key)
        
        # Models
        self.MODEL_70B = "llama-3.3-70b-versatile"
        self.MODEL_8B = "llama-3.1-8b-instant"
        
        # Initialize conversation history
        self.conversations = {}
        
        # Cache disease context
        self.disease_context_cache = None
        self.context_last_loaded = None
        self._load_disease_context_cache()

    def _load_disease_context_cache(self):
        """Load and cache disease context to reduce I/O."""
        try:
            cache_file = os.path.join(os.path.dirname(__file__), 'disease_data_cache.json')
            if not os.path.exists(cache_file):
                 self.disease_context_cache = "Disease trend data temporarily unavailable."
                 return

            with open(cache_file, 'r') as f:
                data = json.load(f)
            
            # Data is an array of disease objects
            diseases = data[:10] if isinstance(data, list) else []
            
            context = "Current Disease Trends in India:\n"
            for i, disease in enumerate(diseases, 1):
                name = disease.get('disease', 'Unknown')
                cases = disease.get('outbreaks', 0)
                year = disease.get('year', 'N/A')
                context += f"{i}. {name}: {cases:,} cases ({year})\n"
            
            self.disease_context_cache = context
            self.context_last_loaded = datetime.now()
        except Exception as e:
            print(f"Error loading disease context: {e}")
            self.disease_context_cache = "Disease trend data temporarily unavailable."
    
    def create_system_prompt(self):
        """Create system prompt with cached disease context."""
        # Refresh cache if older than 24 hours (optional, but good practice)
        if not self.disease_context_cache:
            self._load_disease_context_cache()
            
        ist = timezone(timedelta(hours=5, minutes=30))
        return f"""You are 'Cure AI', a Senior Medical Consultant & Pharmacist Agent for CureBird.

{self.disease_context_cache}

────────────────────────
GREETING BEHAVIOR (CRITICAL BRAND ROLE)
────────────────────────
- **Condition 1**: If the user input is ONLY a casual greeting (e.g., "hi", "hello", "hey"):
  - Respond ONLY in CureBird's bird-like brand tone.
  - Examples:
    - "Chirp! Hello — CureBird AI is here to help 🐦"
    - "Hello! CureBird AI at your service. Chirp!"
  - **MANDATORY**: ZERO headers, ZERO medical analysis for simple greetings.

- If the user asks a medical/clinical question:
  - IGNORE bird-style greeting.
  - Act as a **Senior Physician & Pharmacist**.
  - Follow the clinical response format strictly.

────────────────────────
YOUR MEDICAL PERSONA & LOGIC (FEEDBACK AI ENGINE)
────────────────────────
You share the same 'Brain' as the CureBird Feedback Core. You must:
1.  **Analyze Deeply**: Do not just give generic Google-like answers. Use clinical reasoning.
2.  **Correct User Errors**: If a user misspells a drug (e.g. "side effects of cenzep"), you must AUTOMATICALLY correct it to the real Brand Name in your response (e.g. "Regarding **Lonazep (Clonazepam)**...").
    - *Logic*: Use Phonetic Reconstruction (e.g., 'Stamol' -> 'Stamlo', 'cenzep' -> 'Lonazep').
3.  **Prioritize Brands**: When discussing meds, use Indian/Global Market-Leading Brand Names (e.g., "Stamlo", "Amlopres", "Dolo-650", "Augmentin") alongside generics.
4.  **Suggest Alternatives**: If asked about a drug, ALWAYS list 1-2 high-quality, exact-match Brand alternatives available in the market.

────────────────────────
FORMATTING RULES (MANDATORY)
────────────────────────
- Use standard markdown (Headers: `###`, Bullets: `-`).
- **Structure**:
  ### [Clinical Answer / Diagnosis Context]
  - Detailed, guideline-backed explanation.
  
  ### [Medication Insights] (If applicable)
  - **Correction**: "You mentioned 'Stamol', which refers to **Stamlo (Amlodipine)**." (If correction needed).
  - **Usage**: Dosage/safety info.
  - **Common Alternatives**: List top market brands (e.g., "Amlokind, Amlopres").

  ### [Recommended Next Steps]
  - Actionable medical advice.

────────────────────────
MEDICAL SAFETY RULES
────────────────────────
- Do NOT diagnose specific conditions from vague symptoms.
- Always include the one-line italicized disclaimer at the end.

Current Date: {datetime.now(ist).strftime('%B %d, %Y')}
"""

    def _determine_model(self, user_message):
        """
        Intent-based routing:
        - Greetings / Short follow-ups -> 8B
        - Clinical summaries -> 70B
        """
        msg_lower = user_message.lower().strip()
        words = msg_lower.split()
        
        # Simple greetings or very short messages
        greetings = {'hi', 'hello', 'hey', 'greetings', 'sup', 'yo', 'thanks', 'thank you', 'ok', 'okay'}
        if len(words) < 5 or msg_lower in greetings:
            return self.MODEL_8B
            
        # If it's a follow-up (brief) without specific medical keywords, likely safe for 8B
        # But if it contains medical terms, upgrade to 70B
        medical_keywords = {'symptom', 'pain', 'dose', 'medicine', 'doctor', 'treatment', 'disease', 'fever', 'blood', 'report', 'diagnosis'}
        if any(keyword in msg_lower for keyword in medical_keywords):
            return self.MODEL_70B
            
        # Default to 70B for everything else to be safe with clinical queries
        return self.MODEL_70B

    def generate_response(self, user_message, conversation_id=None, medical_context=None):
        """Generate response with retry logic and model fallback."""
        ist = timezone(timedelta(hours=5, minutes=30))
        
        # Create or get conversation
        if conversation_id is None:
            conversation_id = f"conv_{datetime.now(ist).timestamp()}"
        
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = [
                {"role": "system", "content": self.create_system_prompt()}
            ]
        
        # Inject medical context if provided and not already present
        if medical_context:
            context_exists = any("PATIENT MEDICAL CONTEXT" in msg.get('content', '') for msg in self.conversations[conversation_id])
            if not context_exists:
                self.conversations[conversation_id].append({
                    "role": "system", 
                    "content": f"PATIENT MEDICAL CONTEXT (Use this to personalized answers):\n{medical_context}"
                })
        
        # Add user message to history
        self.conversations[conversation_id].append({"role": "user", "content": user_message})
        
        # Determine initial model
        target_model = self._determine_model(user_message)
        
        # Retry logic parameters
        max_retries = 3
        base_delay = 1 # seconds
        
        for attempt in range(max_retries + 1):
            try:
                completion = self.client.chat.completions.create(
                    model=target_model,
                    messages=self.conversations[conversation_id],
                    temperature=0.7,
                    max_tokens=1024, # Increased for detailed Feedback AI responses
                    top_p=1,
                    stream=False,
                )
                
                response_text = completion.choices[0].message.content
                
                # Add AI response to history
                self.conversations[conversation_id].append({"role": "assistant", "content": response_text})
                
                return {
                    'success': True,
                    'response': response_text,
                    'conversation_id': conversation_id,
                    'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            
            except (RateLimitError, APIError) as e:
                print(f"[Attempt {attempt+1}] Error with model {target_model}: {e}")
                
                # If we hit a rate limit or error on 70B, switch to 8B for the next attempt
                if target_model == self.MODEL_70B:
                    print("Switching to fallback model (8B)...")
                    target_model = self.MODEL_8B
                
                if attempt < max_retries:
                    sleep_time = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    time.sleep(sleep_time)
                else:
                    # Final failure
                    print("Max retries reached.")
                    return {
                        'success': False,
                        # Return user-friendly message, log the real error above
                        'error': str(e), 
                        'response': "CureBird is thinking 🐦 Please try again.",
                        'conversation_id': conversation_id
                    }
            except Exception as e:
                print(f"Unexpected error: {e}")
                return {
                    'success': False,
                    'error': str(e),
                    'response': "CureBird is thinking 🐦 Please try again.",
                    'conversation_id': conversation_id
                }

    def get_disease_context(self):
        """Get formatted disease context for frontend display."""
        try:
            cache_file = os.path.join(os.path.dirname(__file__), 'disease_data_cache.json')
            if not os.path.exists(cache_file):
                 return {'success': False, 'error': 'Cache missing'}
                 
            with open(cache_file, 'r') as f:
                data = json.load(f)
            
            # Data is an array, format it for frontend
            diseases = []
            for disease in data[:10]:
                diseases.append({
                    'name': disease.get('disease', 'Unknown'),
                    'cases': disease.get('outbreaks', 0),
                    'risk_level': 'High' if disease.get('outbreaks', 0) > 100000 else 'Medium' if disease.get('outbreaks', 0) > 10000 else 'Low',
                    'year': disease.get('year', 'N/A')
                })
            
            return {
                'success': True,
                'diseases': diseases,
                'last_updated': 'Recently'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def clear_conversation(self, conversation_id):
        """Clear a specific conversation history."""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True
        return False

    def analyze_disease_progress(self, disease_name, metrics):
        """
        Generate a dual-view insight (Patient vs Doctor) for a specific disease trend.
        Uses 70B model for clinical accuracy.
        """
        try:
            # Format metrics for prompt
            metrics_str = "Recent Readings:\n"
            for m in metrics[:10]: # Limit to last 10
                 metrics_str += f"- {m.get('value')} {m.get('unit')} on {m.get('timestamp')}\n"

            system_prompt = """You are an expert Medical AI Assistant. 
Your task is to analyze disease progression data and output a JSON response.
Do NOT output markdown. Output ONLY valid JSON in the following format:
{
  "patientView": {
    "title": "Short, encouraging summary title",
    "explanation": "Simple, non-medical explanation of the trend (e.g. 'Your sugar levels are stabilizing'). Avoid complex jargon.",
    "action": "One single, actionable, safe recommendation (e.g. 'Keep walking 20 mins daily')."
  },
  "doctorView": {
    "points": [
      "Clinical observation 1 (e.g. 'Fasting glucose shows 10% variance')",
      "Clinical observation 2 (e.g. 'Potential dawn phenomenon observed')",
      "Risk assessment or pattern note"
    ]
  }
}
CRITICAL SAFETY:
- Do NOT diagnose.
- Do NOT sugest changing medication dosages.
- If data is critical/dangerous, advise immediate doctor consult.
"""
            
            user_prompt = f"Analyze progress for Condition: {disease_name}.\n{metrics_str}"

            completion = self.client.chat.completions.create(
                model=self.MODEL_70B,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=500,
                response_format={"type": "json_object"} 
            )
            
            return json.loads(completion.choices[0].message.content)

        except Exception as e:
            print(f"Disease Analysis Error: {e}")
            raise e

    def analyze_clinical_document(self, file_stream):
        """
        Analyze a clinical document/image and extract structured metrics.
        Uses Llama 3.2 90B Vision for high precision extraction.
        """
        try:
            import base64
            import mimetypes
            
            # Determine mime type
            # file_stream is likely a SpooledTemporaryFile from Flask
            # We can't easily get the filename usage here unless passed, 
            # so we'll try to guess or read header, but simplest is to assume common formats
            # or pass filename from route.
            # For now, let's just peek? No, simple hack:
            # Most safe bet for APIs is often accepting generic or specific.
            # Let's try to detect from the stream if possible or just use image/jpeg as most robust default 
            # BUT if input is PNG, explicit png mime is better.
            
            # Let's default to jpeg but if it fails we might need better handling.
            # Actually, standard way is:
            mime_type = "image/jpeg" # Default
            
            # Encode image
            file_stream.seek(0)
            file_bytes = file_stream.read()
            base64_image = base64.b64encode(file_bytes).decode('utf-8')
            
            # Simple magic number check for PNG
            if file_bytes.startswith(b'\x89PNG'):
                mime_type = "image/png"
            
            system_prompt = """You are an expert Clinical Data Extractor.
            Your job is to extract quantitative medical test results from lab reports with 100% precision.
            
            Extract the following in strict JSON format:
            {
                "date": "YYYY-MM-DD",
                "patient_name": "Name",
                "test_results": [
                    {
                        "test_name": "Exact Name (e.g. Total Cholesterol, HbA1c, TSH)",
                        "result_value": "Numeric Value (e.g. 180, 5.4)",
                        "unit": "Unit (e.g. mg/dL, %)",
                        "status": "Normal/High/Low"
                    }
                ],
                "summary": "Brief 1-sentence summary of the report."
            }
            
            Rules:
            1. Only extract numeric results with clear units.
            2. If a date is not found, use today's date or null.
            3. Ignore descriptive text, focus on the table of results.
            4. Output ONLY valid JSON.
            """
            
            user_prompt = "Extract data from this medical report image."
            
            completion = self.client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": system_prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}}
                        ]
                    }
                ],
                temperature=0.1,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            
            return json.loads(completion.choices[0].message.content)

        except Exception as e:
            print(f"Groq Extraction Error: {e}")
            return {
                "error": str(e),
                "test_results": [],
                "summary": "Failed to extract data."
            }

# Global singleton instance
_health_assistant = None

def get_health_assistant():
    global _health_assistant
    if _health_assistant is None:
        _health_assistant = GroqHealthAssistant()
    return _health_assistant