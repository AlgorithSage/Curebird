import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key found: {api_key[:5]}...")

if not api_key:
    print("No Key")
    exit()

genai.configure(api_key=api_key)

models_to_check = [
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro',
    'models/gemini-pro',
    'models/gemini-1.0-pro'
]

try:
    print("\nChecking specific models:")
    available_models = [m.name for m in genai.list_models()]
    
    for model in models_to_check:
        if model in available_models:
            print(f"FOUND: {model}")
        else:
            print(f"MISSING: {model}")
            
    print("\nFirst 5 available models:")
    for m in available_models[:5]:
        print(m)

except Exception as e:
    print(f"Error: {e}")
