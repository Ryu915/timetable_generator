# integrate llm here

from langchain_ollama import OllamaLLM as Ollama
from langchain_core.prompts import PromptTemplate
import json

llm = Ollama(
    model = "llama3",
    temperature = 0,
    base_url="http://localhost:11434" 

)

evalution_prompt = PromptTemplate.from_template("""
You are a technical timetable evaluation expert. 
Your task is to analyze the GENERATED TIMETABLE against the ORIGINAL REQUIREMENTS.

1. ORIGINAL REQUIREMENTS (JSON config):
{config}

2. GENERATED TIMETABLE (JSON result):
{timetable}

STRICT RULES:
- Output MUST be valid JSON.
- Respond ONLY with the JSON object.
- Values must be EXTREMELY CONCISE (no long sentences).

Template:
{{
  "teacher_load_balanced": "True/False",
  "overloaded_teachers": "None or names",
  "top_suggestions": "None or brief bullet points stating improvements"
}}
""")

chain = evalution_prompt | llm

def evaluate_timetable(timetable_json, config_json=None):
    """
    Takes timetable JSON and requirements config, returns a structured evaluation.
    """
    try:
        response = chain.invoke({
            "timetable": json.dumps(timetable_json),
            "config": json.dumps(config_json) if config_json else "{}"
        })

        return safe_parse(response)

    except Exception as e:
        return {
            "error": "LLM evaluation failed",
            "details": str(e)
        }


def safe_parse(response):
    """
    Ensures LLM output is valid JSON.
    """
    try:
       
        clean = response.strip()
        if clean.startswith("```json"): clean = clean[7:]
        if clean.startswith("```"): clean = clean[3:]
        if clean.endswith("```"): clean = clean[:-3]
        return json.loads(clean.strip())
    except Exception:
        return {
            "error": "Invalid JSON from LLM",
            "raw_output": response
        }

