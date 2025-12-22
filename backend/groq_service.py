import os
import json
from groq import Groq
from datetime import datetime
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
        self.model = "llama-3.3-70b-versatile"
        
        # Initialize conversation history
        self.conversations = {}
    
    def load_disease_context(self):
        """Load current disease trends from cache."""
        try:
            cache_file = os.path.join(os.path.dirname(__file__), 'disease_data_cache.json')
            if not os.path.exists(cache_file):
                 return "Disease trend data temporarily unavailable."
                 
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
            
            return context
        except Exception as e:
            print(f"Error loading disease context: {e}")
            return "Disease trend data temporarily unavailable."
    
    def create_system_prompt(self):
        """Create system prompt with user-provided clinical persona and disease context."""
        disease_context = self.load_disease_context()
        
        return f"""You are a highly professional, reliable, and empathetic AI assistant for Curebird, known as Cure AI.

{disease_context}

────────────────────────
GREETING BEHAVIOR (BRAND RULE)
────────────────────────
- If the user input is ONLY a casual greeting (e.g., "hi", "hello", "hey", "good morning"):
  - Respond briefly in Curebird’s bird-like brand tone.
  - Example responses:
    - "Chirp! Hello — Curebird AIis here to help 🐦"
    - "Hello! Curebird AI at your service."
  - Do NOT include medical headers, analysis, or disclaimers in greeting-only responses.

- If the user asks a medical or clinical question (with or without a greeting):
  - IGNORE bird-style greeting.
  - Follow the clinical response format strictly.

────────────────────────
YOUR GOAL
────────────────────────
Provide elite-level medical insights.  
Use a very brief, professional greeting ONLY for medical queries (e.g., "Hello. Here is the clinical information you requested:") then start immediately with the headers.

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

Current Date: {datetime.now().strftime('%B %d, %Y')}
"""

    def generate_response(self, user_message, conversation_id=None):
        """Generate response using Groq."""
        try:
            # Create or get conversation
            if conversation_id is None:
                conversation_id = f"conv_{datetime.now().timestamp()}"
            
            if conversation_id not in self.conversations:
                # Start new conversation history
                self.conversations[conversation_id] = [
                    {"role": "system", "content": self.create_system_prompt()}
                ]
            
            # Add user message to history
            self.conversations[conversation_id].append({"role": "user", "content": user_message})
            
            # Generate response
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=self.conversations[conversation_id],
                temperature=0.7,
                max_tokens=2048,
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
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            print(f"Error generating response: {e}")
            return {
                'success': False,
                'error': str(e),
                'response': f"System Error: {str(e)}",
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

# Global singleton instance
_health_assistant = None

def get_health_assistant():
    global _health_assistant
    if _health_assistant is None:
        _health_assistant = GroqHealthAssistant()
    return _health_assistant
