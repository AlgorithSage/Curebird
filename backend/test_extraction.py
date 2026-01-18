import requests
import os

# Configuration
BASE_URL = "http://localhost:5001"
TEST_IMAGE_PATH = r"C:\Users\USER\.gemini\antigravity\brain\1e033b9c-c378-45ba-93c3-afdeaf506aca\uploaded_image_2_1768748272008.png"

def test_extraction():
    print(f"Testing extraction on {BASE_URL}/api/analyze-report")
    print(f"Using image: {TEST_IMAGE_PATH}")
    
    if not os.path.exists(TEST_IMAGE_PATH):
        print("Error: Test image not found.")
        return

    try:
        with open(TEST_IMAGE_PATH, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/analyze-report", files=files)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n--- Full Response ---")
            print(data)
            
            print("\n--- Extracted Data ---")
            print(f"Patient: {data.get('patient_name')}")
            print(f"Date: {data.get('date')}")
            print(f"Test Results: {len(data.get('test_results', []))} items found")
            for item in data.get('test_results', []):
                print(f" - {item.get('test_name')}: {item.get('result_value')} {item.get('unit')} ({item.get('status')})")
            print("\n--- Summary ---")
            print(data.get('summary'))
        else:
            print("Error Response:", response.text)
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_extraction()
