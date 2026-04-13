import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def diagnose():
    key = os.getenv('GEMINI_API_KEY')
    print(f"Key found: {bool(key)}")
    if not key:
        return

    print(f"Key starts with: {key[:10]}...")
    
    try:
        genai.configure(api_key=key)
        print("Attempting to list models...")
        models = genai.list_models()
        model_list = [m.name for m in models]
        print(f"Available models: {model_list}")
        
        if model_list:
            print(f"Success! Found {len(model_list)} models.")
            # Try a test generation
            m_name = model_list[0].replace('models/', '')
            print(f"Testing generation with: {m_name}")
            model = genai.GenerativeModel(m_name)
            res = model.generate_content("Hello", generation_config={"max_output_tokens": 5})
            print(f"Generation test: {res.text}")
        else:
            print("Zero models returned. This key might not have Gemini permissions.")
            
    except Exception as e:
        print(f"DIAGNOSTIC CRASH: {e}")

if __name__ == "__main__":
    diagnose()
