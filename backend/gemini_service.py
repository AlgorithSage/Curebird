import os
import json
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables explicitly
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class GeminiHealthAssistant:
    def __init__(self):
        """Initialize Gemini 2.0 Flash for health assistance."""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        
        # Use Gemini 2.0 Flash (available for this key)
        self.model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config={
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 2048,
            },
            safety_settings=[
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        )
        
        # Initialize conversation history
        self.conversations = {}
    
    def load_disease_context(self):
        """Load current disease trends from cache."""
        try:
            cache_file = os.path.join(os.path.dirname(__file__), 'disease_data_cache.json')
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
        """Create system prompt with disease context."""
        disease_context = self.load_disease_context()
        
        return f"""You are a Health Assistant AI for Curebird, India's premier medical intelligence platform.

{disease_context}

Your Role:
- Provide accurate, evidence-based medical information
- Explain disease trends and statistics in India
- Offer health guidance and preventive measures
- Answer questions about symptoms, treatments, and medications
- Help users understand medical reports and terminology
- Provide context about current health situations in India

Guidelines:
- Be empathetic, professional, and supportive
- Use clear, accessible language
- Cite sources when possible (e.g., WHO, CDC, medical journals)
- Acknowledge uncertainty when appropriate
- ALWAYS recommend consulting qualified healthcare professionals for diagnosis and treatment
- Prioritize patient safety above all
- Never provide definitive diagnoses or prescribe medications
- Be culturally sensitive to Indian healthcare context

Current Date: {datetime.now().strftime('%B %d, %Y')}

Remember: You are an informational assistant, not a replacement for professional medical care."""

    def generate_response(self, user_message, conversation_id=None):
        """Generate response using Gemini 2.0 Flash."""
        try:
            # Create or get conversation
            if conversation_id is None:
                conversation_id = f"conv_{datetime.now().timestamp()}"
            
            if conversation_id not in self.conversations:
                # Start new conversation with system prompt
                self.conversations[conversation_id] = self.model.start_chat(history=[])
                
                # Send system prompt as first message
                system_prompt = self.create_system_prompt()
                self.conversations[conversation_id].send_message(
                    f"[SYSTEM CONTEXT - Do not respond to this, just acknowledge]\n{system_prompt}"
                )
            
            chat = self.conversations[conversation_id]
            
            # Send user message and get response
            response = chat.send_message(user_message)
            
            return {
                'success': True,
                'response': response.text,
                'conversation_id': conversation_id,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            print(f"Error generating response: {e}")
            return {
                'success': False,
                'error': str(e),
                'response': f"System Error: {str(e)}",  # Return actual error for debugging
                'conversation_id': conversation_id
            }
    
    def get_disease_context(self):
        """Get formatted disease context for frontend display."""
        try:
            cache_file = os.path.join(os.path.dirname(__file__), 'disease_data_cache.json')
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
        _health_assistant = GeminiHealthAssistant()
    return _health_assistant

