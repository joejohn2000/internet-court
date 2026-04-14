import os
import google.generativeai as genai
import random

def get_best_model():
    """Helper to find the best available Gemini model."""
    try:
        # Prioritize flash, then pro variants
        model_names = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
        for name in model_names:
            try:
                m = genai.GenerativeModel(name)
                # Verify access with a zero-token ping
                m.generate_content("ping", generation_config={"max_output_tokens": 1})
                return m
            except:
                continue
    except:
        pass
    return genai.GenerativeModel('gemini-1.5-flash')

def generate_ai_analysis(case_id, title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return "ERROR: AI Judge Offline. (API Key Missing)."
    
    try:
        genai.configure(api_key=api_key)
        model = get_best_model()
        
        prompt = f"""
        ACT AS: The Chief AI Judge of the 'Internet Court'. 
        YOUR TASK: Analyze the following social conflict and provide a clear, authoritative, and professional legal-style opinion.
        
        CASE DATA:
        Reference: Case #{case_id}
        Title: {title}
        Testimony: {story}
        
        REQUIRED FORMAT:
        - LEGAL ANALYSIS: [Summarize the core ethical or social violation clearly]
        - THE COURT'S REASONING: [Provide an objective logical breakdown of why this is right or wrong]
        - JUDGE'S RECOMMENDATION: [Give a clear advisory or resolution for the jury to consider]
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"CRITICAL CORE FAILURE: The Arbiter encountered a logic error. (Error: {str(e)[:50]})"

def generate_ai_hook(title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key: return f"UNVERIFIED DOCKET: {title}"
    
    try:
        genai.configure(api_key=api_key)
        model = get_best_model()
        prompt = f"System: Viral Headline Synthesizer. Task: Refactor '{title}' into a punchy, click-baity Internet Court Hook. Max 10 words."
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return f"TRANSMISSION ERROR: {title}"
