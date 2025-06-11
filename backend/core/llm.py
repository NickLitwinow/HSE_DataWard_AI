import ollama
import json
from pydantic import BaseModel

from core.profiler import DataFrameProfile


class LLMAnalysis(BaseModel):
    quality_score: int
    summary: str
    recommendations: list[str]


def generate_llm_analysis(profile: DataFrameProfile) -> LLMAnalysis:
    client = ollama.Client(host="http://ollama:11434", timeout=300)

    # Summarize the profile to create a more concise prompt
    summary_for_prompt = {
        "num_rows": profile.num_rows,
        "num_columns": profile.num_columns,
        "num_duplicate_rows": profile.num_duplicate_rows,
        "columns_with_missing_values": [
            col
            for col, prof in profile.column_profiles.items()
            if prof.missing_values > 0
        ],
    }

    prompt = f"""
    Ты — ассистент по качеству данных. Проанализируй следующую краткую сводку по датасету.
    Твоя задача — оценить общее качество данных по 10-балльной шкале,
    сформулировать краткое резюме по основным проблемам (например, наличие дубликатов, пропусков) и дать список конкретных рекомендаций по улучшению.

    Сводка по данным:
    {json.dumps(summary_for_prompt, indent=2, ensure_ascii=False)}

    Ответ должен быть строго в формате JSON со следующими ключами: "quality_score", "summary", "recommendations".
    "quality_score" - число от 1 до 10, где 10 - идеальное качество.
    "summary" - краткое текстовое описание (2-3 предложения) основных проблем.
    "recommendations" - список строк с четкими советами.
    Говори на русском языке.
    """

    response = client.chat(
        model="llama3",
        messages=[{"role": "user", "content": prompt}],
        format="json",
    )

    print("RAW LLM Response:", response["message"]["content"])

    # The response content is a JSON string, so we need to parse it.
    llm_response_data = json.loads(response["message"]["content"])

    return LLMAnalysis(**llm_response_data) 