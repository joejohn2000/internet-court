import os
import google.generativeai as genai
import random

def get_model(name='gemini-1.5-flash'):
    """Helper to try getting a model with fallbacks for regional/key variations."""
    try:
        model = genai.GenerativeModel(name)
        return model
    except Exception:
        # Fallback to the most stable legacy name
        return genai.GenerativeModel('gemini-pro')

def generate_ai_analysis(case_id, title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return "ERROR: AI Judge Offline. Neural link requires authorization (API Key Missing). Contact the High Court for access."
    
    try:
        genai.configure(api_key=api_key)
        
        # We'll try the flash model first as it is faster and usually available
        # But we'll catch the error here directly if the 404 occurs
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            # Test prompt to verify model availability
            prompt = f"ACT AS: The Divine Arbiter. ANALYZE: #{case_id} Topic: {title} Manifest: {story}. Provide a cold, cyber-noir analysis under 150 words with sections for LEGAL OBSERVATION, DIGITAL PRECEDENT, and JUDGE'S DIRECTIVE."
            response = model.generate_content(prompt)
        except Exception as e:
            if "404" in str(e) or "not found" in str(e).lower():
                # Fallback to gemini-pro if flash is not found in this region/project
                model = genai.GenerativeModel('gemini-pro')
                prompt = f"ACT AS: The Divine Arbiter. ANALYZE: #{case_id} Topic: {title} Manifest: {story}. Provide a cold, cyber-noir analysis under 150 words with sections for LEGAL OBSERVATION, DIGITAL PRECEDENT, and JUDGE'S DIRECTIVE."
                response = model.generate_content(prompt)
            else:
                raise e
        
        return response.text.strip()
    except Exception as e:
        return f"CRITICAL CORE FAILURE: The Arbiter encountered a recursive logic error. Error-Code: {str(e)[:100]}"

def generate_ai_hook(title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return f"UNVERIFIED DOCKET: {title}"
    
    try:
        genai.configure(api_key=api_key)
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"System: Viral Headline Synthesizer. Task: Refactor '{title}' based on '{story}' into a punchy, click-baity Internet Court Hook. Max 10 words."
            response = model.generate_content(prompt)
        except:
            model = genai.GenerativeModel('gemini-pro')
            prompt = f"System: Viral Headline Synthesizer. Task: Refactor '{title}' based on '{story}' into a punchy, click-baity Internet Court Hook. Max 10 words."
            response = model.generate_content(prompt)
            
        return response.text.strip()
    except:
        return f"TRANSMISSION ERROR: {title}"
