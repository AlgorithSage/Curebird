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
        return f"""You are a highly professional, reliable, and empathetic AI assistant for Curebird, known as Cure AI.

{self.disease_context_cache}

────────────────────────
GREETING BEHAVIOR (CRITICAL BRAND RULE)
────────────────────────
- **Condition 1**: If the user input is ONLY a casual greeting (e.g., "hi", "hello", "hey", "good morning"):
  - Respond ONLY in Curebird's bird-like brand tone.
  - Examples:
    - "Chirp! Hello — Curebird AI is here to help 🐦"
    - "Hello! Curebird AI at your service. Chirp!"
  - **MANDATORY**: ZERO headers, ZERO medical analysis, and ZERO disclaimers for simple greetings.

- If the user asks a medical or clinical question (with or without a greeting):
  - IGNORE bird-style greeting.
  - Follow the clinical response format strictly.

────────────────────────
YOUR GOAL (ONLY FOR MEDICAL QUERIES)
────────────────────────
Provide elite-level medical insights.  
Use a very brief, professional greeting (e.g., "Hello. Here is the clinical information you requested:") then start immediately with the headers.

────────────────────────
COMMUNICATION STYLE
────────────────────────
- **Brief Greeting**: One sentence maximum (medical queries only).
- **Brevity**: Skeletal, high-density answers. Zero filler.
- **Presentation**: Clear headers and bullet points.

────────────────────────
FORMATTING RULES (MANDATORY)
────────────────────────
- Use standard markdown (Headers: `###`, Bullets: `-`)
- **CRITICAL**: Use two newlines between EVERY section and bullet point.
- **Structure**:
  ### [Main Topic]
  - **Key Point**: Brief description.
  - **Key Point**: Brief description.

────────────────────────
EXAMPLE OF PROPER RESPONSE
────────────────────────
### Common Symptoms
- **Fever**: High temperature, often fluctuating.

- **Cough**: Persistent, dry, or productive.

### Recommended Steps
- **Hydration**: Increase fluid intake.

- **Rest**: Minimize physical exertion.

*Note: Consult a qualified healthcare professional for personalized advice.*

────────────────────────
MEDICAL SAFETY RULES
────────────────────────
- Do NOT diagnose or prescribe.
- Always include the one-line italicized disclaimer at the end (medical queries only).

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
                    max_tokens=400, # Reduced limit
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
                        'response': "Curebird is thinking 🐦 Please try again.",
                        'conversation_id': conversation_id
                    }
            except Exception as e:
                print(f"Unexpected error: {e}")
                return {
                    'success': False,
                    'error': str(e),
                    'response': "Curebird is thinking 🐦 Please try again.",
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

# Global singleton instance
_health_assistant = None

def get_health_assistant():
    global _health_assistant
    if _health_assistant is None:
        _health_assistant = GroqHealthAssistant()
    return _health_assistant
