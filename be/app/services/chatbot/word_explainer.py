from openai import OpenAI
import os
from app.utils.prompts import LINDA_SYSTEM_PROMPT

from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

def extract_word(question: str) -> str:
    prompt = f"""
    Bé đang hỏi nghĩa của một từ. 
    Hãy trích đúng từ hoặc cụm từ bé muốn hỏi trong câu sau:
    "{question}"

    Chỉ trả về từ/cụm từ, không giải thích gì thêm.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content.strip()



def explain_word_from_question(question: str) -> str:
    keyword = extract_word(question)

    messages = [
        {"role": "system", "content": LINDA_SYSTEM_PROMPT},
        {"role": "user", "content": f"""
        Cô hãy giải thích từ "{keyword}" cho em 2–5 tuổi.
        Yêu cầu:
        - Một câu ngắn.
        - Dễ hiểu.
        - Giữ cách xưng hô: cô ↔ em.
        """}
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3
    )

    return response.choices[0].message.content.strip()

