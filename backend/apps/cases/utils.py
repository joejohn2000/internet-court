import os
import google.generativeai as genai
import random

def get_best_model():
    """Exhaustively try to find a working model."""
    errors = []
    # 1. Try dynamic discovery
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        for preferred in ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-1.0-pro', 'models/gemini-pro']:
            if preferred in models:
                return genai.GenerativeModel(preferred.replace('models/', '')), None
        if models:
            return genai.GenerativeModel(models[0].replace('models/', '')), None
    except Exception as e:
        errors.append(f"ListModels failed: {str(e)}")

    # 2. Try hardcoded common names
    for name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro']:
        try:
            m = genai.GenerativeModel(name)
            # Try a tiny generation to verify
            m.generate_content("hi", generation_config={"max_output_tokens": 1})
            return m, None
        except Exception as e:
            errors.append(f"{name} failed: {str(e)}")
            
    return None, " | ".join(errors)

def generate_ai_analysis(case_id, title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return "ERROR: AI Judge Offline. (API Key Missing)."
    
    try:
        genai.configure(api_key=api_key)
        model, error = get_best_model()
        
        prompt = f"""
        ACT AS: The Divine Arbiter.
        ANALYZE: #{case_id} Topic: {title} Manifest: {story}. 
        Provide a cold, cyber-noir analysis under 150 words with sections:
        LEGAL OBSERVATION, DIGITAL PRECEDENT, JUDGE'S DIRECTIVE.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"CRITICAL CORE FAILURE: The Arbiter encountered a recursive logic error. Error: {str(e)[:150]}"

def generate_ai_hook(title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return f"UNVERIFIED DOCKET: {title}"
    
    try:
        genai.configure(api_key=api_key)
        model, error = get_best_model()
        if not model: return f"HOOK_ERROR: {title}"
        
        prompt = f"System: Viral Headline Synthesizer. Task: Refactor '{title}' based on '{story}' into a punchy, click-baity Internet Court Hook. Max 10 words."
        response = model.generate_content(prompt)
            
        return response.text.strip()
    except:
        return f"TRANSMISSION ERROR: {title}"
