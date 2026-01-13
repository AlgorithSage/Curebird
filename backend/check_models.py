import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

keys = {
    "GROQ_API_KEY_VISION": os.getenv('GROQ_API_KEY_VISION'),
    "GROQ_API_KEY": os.getenv('GROQ_API_KEY')
}

for name, key in keys.items():
    print(f"\n--- Testing Key: {name} ---")
    if not key:
        print("  [Missing]")
        continue
        
    print(f"  Key: {key[:5]}...{key[-4:]}")
    client = Groq(api_key=key)
    
    try:
        models = client.models.list()
        vision_found = False
        for m in models.data:
            if 'vision' in m.id:
                print(f"  [AVAILABLE] {m.id}")
                vision_found = True
        
        if not vision_found:
            print("  [NO VISION MODELS FOUND]")
    except Exception as e:
        print(f"  [ERROR] {e}")
