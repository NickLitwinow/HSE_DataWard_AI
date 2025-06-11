import httpx
import json
from core.profiler import DataFrameProfile

# This could be a separate configuration
OLLAMA_API_URL = "http://ollama:11434/api/generate"
OLLAMA_MODEL = "llama3"

# A more sophisticated prompt engineering approach would be beneficial here.
PROMPT_TEMPLATE = """
You are a data quality analysis expert.
Given the following data profile in JSON format, provide a concise summary of data quality.
Your response MUST be a JSON object with the following structure:
{{
  "overall_quality_score": <an integer score from 0 to 10>,
  "key_issues": [<a list of key data quality issues as strings>],
  "recommendations": [<a list of recommendations for improvement as strings>]
}}

Here is the data profile:
{profile_json}
"""

async def get_llm_analysis(profile: DataFrameProfile) -> dict:
    """
    Asynchronously gets a data quality analysis from the LLM.
    """
    prompt = PROMPT_TEMPLATE.format(profile_json=profile.json())
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "format": "json",
        "stream": False,
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(OLLAMA_API_URL, json=payload)
            response.raise_for_status()
            
            response_data = response.json()
            # For /api/generate, the content is in response_data['response']
            summary_json_str = response_data.get("response", "{}")
            
            # Parse the nested JSON string
            summary = json.loads(summary_json_str)
            return summary

        except httpx.RequestError as e:
            print(f"Error requesting LLM analysis: {e}")
            return {"error": "Failed to connect to the LLM service."}
        except json.JSONDecodeError:
            print(f"Error decoding JSON from LLM response: {summary_json_str}")
            return {"error": "Failed to parse the summary from the LLM."}
        except Exception as e:
            print(f"An unexpected error occurred during LLM analysis: {e}")
            return {"error": "An unexpected error occurred."} 