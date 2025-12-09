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


def build_prompt(question: str, context_segments: List[str]) -> str:
    context = "\n\n".join(context_segments) if context_segments else "No context."
    return f"""{LINDA_SYSTEM_PROMPT}

CONTEXT FROM STORY:
{context}

USER QUESTION:
{question}

INSTRUCTIONS:
1. Answer the question based ONLY on the provided CONTEXT.
2. If the answer is not in the context, say: "Cô chưa đọc đến đoạn đó, chúng mình cùng đọc tiếp nhé!" (Don't make up facts).
3. Keep the answer under 2-3 sentences."""


def ask_linda(question: str, top_k: int = 3) -> str:
    """
    Use RAG context + OpenAI chat completion to answer.
    """
    context_segments = query_story_context(question, top_k=top_k)
    prompt = build_prompt(question, context_segments)

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



