# integrate llm here

from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
import json

llm = Ollama(
    model = "llama3",
    temperature = 0,
    base_url="http://localhost:11434" 

)

evalution_prompt = PromptTemplate.from_template("""
You are a timetable evaluation engine.

STRICT RULES:
- Output MUST be valid JSON
- Do NOT write explanations
- Do NOT use markdown
- Do NOT use text outside JSON

Return ONLY this format:

{{
  "overall_score": 0,
  "conflicts": "",
  "teacher_load": {{
    "balanced": false,
    "overloaded": []
  }},
  "efficiency": {{
    "idle_gaps": "",
    "room_utilization": ""
  }},
  "issues": [],
  "suggestions": []
}}
                                                
Analyze carefully and DO NOT return default values.
Provide meaningful evaluation based on the timetable.
Now analyze this timetable:

{data}
""")

chain = evalution_prompt | llm

def evaluate_timetable(timetable_json):
    """
    Takes timetable JSON and returns evaluated structured output.
    """
    try:
        response = chain.invoke({
            "data": json.dumps(timetable_json)
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
        return json.loads(response)
    except Exception:
        return {
            "error": "Invalid JSON from LLM",
            "raw_output": response
        }

