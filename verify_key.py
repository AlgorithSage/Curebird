import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the .env file explicitly
load_dotenv('backend/.env')

api_key = os.getenv('GEMINI_API_KEY')
print(f"Testing API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("Error: No API Key found in environment.")
    exit(1)

genai.configure(api_key=api_key)

try:
    # Use gemini-2.0-flash found in available models
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hello")
    print("Success! API Key is working.")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
