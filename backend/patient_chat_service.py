import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class PatientPersonaService:
    def __init__(self):
        """Initialize Groq for Patient Roleplay."""
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            # Fallback or error - relying on the one in .env
            print("Warning: GROQ_API_KEY not found in environment for Patient Service")
        
        self.client = Groq(api_key=api_key)
        self.MODEL = "llama-3.1-8b-instant" # Fast, efficient model for chat

    def generate_patient_reply(self, history, patient_context):
        """
        Generate a reply from the patient's perspective.
        
        Args:
            history (list): List of message objects {sender: 'doctor'|'patient', text: '...'}
            patient_context (dict): {patient: 'Name', age: 34, condition: '...', status: '...'}
        
        Returns:
            str: The patient's reply.
        """
        try:
            # 1. Construct System Prompt
            name = patient_context.get('patient', 'Patient')
            condition = patient_context.get('condition', 'Unknown Condition')
            age = patient_context.get('age', 'Unknown Age') # Might not be in context, assume generic if missing
            
            system_prompt = f"""You are {name}, a patient with {condition}. 
You are chatting with your doctor on a secure messaging app.
Current Context: You are {patient_context.get('status', 'stable')}.

ROLEPLAY RULES:
- Keep your responses SHORT (1-2 sentences max).
- Be casual but respectful.
- Do NOT act like an AI. Do not use headers or markdown.
- Respond directly to what the doctor asks.
- If asking about symptoms, be specific based on your condition ({condition}).
- You are NOT a medical expert. You are the patient.
"""

            # 2. Build Message Chain
            formatted_messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            for msg in history:
                role = "user" if msg.get('sender') == 'doctor' else "assistant"
                content = msg.get('text', '')
                if content:
                    formatted_messages.append({"role": role, "content": content})

            # 3. Call LLM
            completion = self.client.chat.completions.create(
                model=self.MODEL,
                messages=formatted_messages,
                temperature=0.7, # Slightly creative for variations
                max_tokens=150,
                top_p=1,
                stream=False,
            )
            
            return completion.choices[0].message.content.strip()

        except Exception as e:
            print(f"Error generating patient reply: {e}")
            return "I'm sorry, I didn't verify that properly. Could you repeat it?"

# Singleton Pattern
_patient_service = None

def get_patient_service():
    global _patient_service
    if _patient_service is None:
        _patient_service = PatientPersonaService()
    return _patient_service
