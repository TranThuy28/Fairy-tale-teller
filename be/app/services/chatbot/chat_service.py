import logging
from typing import Optional, List

from openai import OpenAI

from app.core.config import settings
from app.services.rag.retriever import query_story_context
from app.utils.prompts import LINDA_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=settings.pinkyne_api_key,
    base_url=settings.pinkyne_base_url,
)


def build_prompt(
    question: str,
    context_segments: List[str],
    memories: str = "",
) -> str:
    context = "\n\n".join(context_segments) if context_segments else "No context."
    memory_block = memories or "Chưa có thông tin gì về sở thích của bé."
    return f"""{LINDA_SYSTEM_PROMPT}

THÔNG TIN CÔ BIẾT VỀ BÉ (MEMORY):
{memory_block}

NGỮ CẢNH TỪ TRUYỆN (RAG):
{context}

CÂU HỎI CỦA BÉ:
{question}

HƯỚNG DẪN:
1. Trả lời dựa TRÊN HAI PHẦN: ký ức về bé (MEMORY) và ngữ cảnh từ truyện (RAG).
2. Nếu câu trả lời KHÔNG có trong ngữ cảnh truyện, hãy nói: "Cô chưa đọc đến đoạn đó, chúng mình cùng đọc tiếp nhé!" và KHÔNG bịa chuyện.
3. Trả lời ngắn gọn trong 2–3 câu, dùng ngôn ngữ đơn giản cho bé 2–5 tuổi.
"""


def ask_linda(
    question: str,
    top_k: int = 3,
    filename: Optional[str] = None,
    memories_text: str = "",
) -> str:
    """
    Use RAG context + optional long-term memory + OpenAI chat completion to answer.
    """
    context_segments = query_story_context(question, top_k=top_k, filename=filename)
    prompt = build_prompt(question, context_segments, memories_text)

    messages = [
        {"role": "system", "content": LINDA_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.2,
    )

    answer = response.choices[0].message.content.strip()
    return answer
