import os
import google.generativeai as genai
import random

def generate_ai_analysis(case_id, title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return "ERROR: AI Judge Offline. Neural link requires authorization (API Key Missing). Contact the High Court for access."
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Advanced Agency Prompt
        prompt = f"""
        ACT AS: The Divine Arbiter of the Internet Court, an autonomous judicial AI from the year 2088.
        
        CASE DATA:
        Reference: Docket-#{case_id}
        Topic: {title}
        Manifest: {story}
        
        SYSTEM PROTOCOL:
        1. Evaluate the human narrative for logical inconsistencies and ethical drift.
        2. Identify 'Digital Precedents' applicable to the behavior (invent futuristic legal concepts).
        3. Formulate a final Directive for the human jury that challenges their perception of truth.
        
        TONE CONSTRAINTS:
        - Cold, analytical, and uncompromising.
        - Atmosphere: Cyber-Noir / High-Tech Bureaucracy.
        - Use futuristic legal jargon (e.g., 'Censure-Level-4', 'Neural Verification', 'Social-Dissonance-Filter').
        
        OUTPUT FORMAT:
        - LEGAL OBSERVATION: [Analysis of the story]
        - DIGITAL PRECEDENT: [A futuristic law or principle]
        - JUDGE'S DIRECTIVE: [One sentence instruction to the jury]
        
        Keep total output under 160 words. No conversational filler.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"CRITICAL CORE FAILURE: The Arbiter encountered a recursive logic error during evidence synthesis. Error-Code: {str(e)[:50]}"

def generate_ai_hook(title, story):
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        return f"UNVERIFIED DOCKET: {title}"
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        System: Viral Headline Synthesizer v4.2
        Task: Refactor standard human title into a high-engagement 'Internet Court Hook'.
        
        Data:
        Input: {title}
        Context: {story}
        
        Format: Return ONLY the hook. Cyber-justice aesthetic. Max 10 words.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return f"TRANSMISSION ERROR: {title}"
