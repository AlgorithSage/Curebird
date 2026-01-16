
import os
import base64
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GROQ_API_KEY')
print(f"Using API Key: {api_key[:10]}...")

client = Groq(api_key=api_key)

# 100x70 PNG base64 (iVBOR... is PNG signature)
dummy_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABGAQMAAAAAS7O5AAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAABBJREFUeF7NwAEBAAAAQqP+r25IAQEAAAAAAAD8AwYAAAH6d62hAAAAAElFTkSuQmCC"

def test_model(name):
    print(f"\nTesting {name} with valid PNG mime type...")
    try:
        completion = client.chat.completions.create(
            model=name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this image in one word."},
                        # CORRECTED: data:image/png
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{dummy_image_b64}"}}
                    ]
                }
            ],
            max_tokens=10
        )
        print("SUCCESS!")
        print(completion.choices[0].message.content)
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

# Test Maverick (Strong candidate from user list)
test_model("meta-llama/llama-4-maverick-17b-128e-instruct")

# Test 90b again just in case
test_model("llama-3.2-90b-vision-preview")
