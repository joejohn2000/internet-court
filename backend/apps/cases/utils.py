import os
import google.generativeai as genai
import random

def get_best_model():
    """Dynamically find the best available model for this key."""
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        # Prefer flash, then pro, then any
        for preferred in ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-pro']:
            if preferred in models:
                return genai.GenerativeModel(preferred.replace('models/', ''))
        if models:
            return genai.GenerativeModel(models[0].replace('models/', ''))
    except:
        pass
    return genai.GenerativeModel('gemini-1.5-flash') # Ultimate fallback

def generate_ai_analysis(case_id, title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return "ERROR: AI Judge Offline. Neural link requires authorization (API Key Missing). Contact the High Court for access."
    
    try:
        genai.configure(api_key=api_key)
        model = get_best_model()
        
        prompt = f"""
        ACT AS: The Divine Arbiter.
        ANALYZE: #{case_id} Topic: {title} Manifest: {story}. 
        Provide a cold, cyber-noir analysis under 150 words with sections:
        LEGAL OBSERVATION, DIGITAL PRECEDENT, JUDGE'S DIRECTIVE.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"CRITICAL CORE FAILURE: The Arbiter encountered a recursive logic error. Error-Code: {str(e)[:150]}"

def generate_ai_hook(title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return f"UNVERIFIED DOCKET: {title}"
    
    try:
        genai.configure(api_key=api_key)
        model = get_best_model()
        
        prompt = f"System: Viral Headline Synthesizer. Task: Refactor '{title}' based on '{story}' into a punchy, click-baity Internet Court Hook. Max 10 words."
        response = model.generate_content(prompt)
            
        return response.text.strip()
    except:
        return f"TRANSMISSION ERROR: {title}"
