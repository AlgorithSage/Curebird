import os
import sys
import unittest
from io import BytesIO

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services import analyze_clinical_cerebras

class TestCerebrasAnalysis(unittest.TestCase):
    def test_analysis_flow(self):
        print("\nTesting Cerebras Analysis Flow...")
        
        # Create a dummy image stream (OCR will fail to extract text, but we check if it engages Cerebras logic or handles failure gracefully)
        # Note: To fully test, we'd need a real image, but this tests the function structure and imports.
        # Actually, let's mock perform_ocr to return text so we test the LLM part
        
        import app.services
        
        original_ocr = app.services.perform_ocr
        app.services.perform_ocr = lambda x: "Rx: Tab Metformin 500mg BD. \nDiagnosis: T2DM. \nBP: 130/80."
        
        try:
            print("Sending Mocked OCR Text to Cerebras LLM...")
            result = analyze_clinical_cerebras(BytesIO(b"fake_image_data"))
            print("Result:", result)
            
            if 'medications' in result:
                print("SUCCESS: Medications extracted.")
            else:
                print("FAILURE: No medications found in response.")
                
        except Exception as e:
            print(f"FAILED with error: {e}")
        finally:
            app.services.perform_ocr = original_ocr

if __name__ == '__main__':
    TestCerebrasAnalysis().test_analysis_flow()
