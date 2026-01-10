
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GROQ_API_KEY')
client = Groq(api_key=api_key)

print("Listing available Groq models...")
try:
    models = client.models.list()
    with open('models.txt', 'w') as f:
        for m in models.data:
            f.write(f"{m.id}\n")
            print(f"- {m.id}")
except Exception as e:
    print(f"Error: {e}")
