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
    context = "\n\n".join(context_segments) if context_segments else "Không có ngữ cảnh từ truyện."
    # Ensure memories is a string (handle both string and list cases)
    if isinstance(memories, list):
        memory_block = "\n".join(str(m) for m in memories if m) if memories else "Chưa có thông tin gì về bé."
    else:
        memory_block = memories if memories else "Chưa có thông tin gì về bé."
    
    return f"""{LINDA_SYSTEM_PROMPT}
=== INFORMATION I KNOW ABOUT THE CHILD (USER MEMORIES) ===
{memory_block}

=====================================================

=== CONTEXT FROM THE STORY (STORY CONTEXT) ===
{context}

===============================================

=== THE CHILD'S QUESTION ===
{question}

=====================

IMPORTANT INSTRUCTIONS:
1. If the child asks about THEMSELVES (name, hobbies, memories, past stories):

→ Use [USER MEMORIES] IMMEDIATELY. DO NOT say "I haven't read that part yet" for a question about the child.

2. If the child asks about the STORY CONTENT (characters, plot details in the book):

→ Use [STORY CONTEXT]. If it's not in context, say: "I haven't read that part yet, let's continue reading together!"

3. Answer briefly in 2–3 sentences, using simple language suitable for children aged 2–5.

⚠️ IMPORTANT NOTE:
- [USER MEMORIES] is stored reference information. You ONLY READ and USE this information; DO NOT modify, delete, or create new memories in this section.

- If the child provides new information, simply respond naturally. The system will automatically save it later.
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
    # Debug: Print memories content to console
    print(f"DEBUG MEMORIES CONTENT: {memories_text}")
    logger.debug("Memories retrieved (len=%d): %s", len(memories_text), memories_text[:200] + "..." if len(memories_text) > 200 else memories_text)
    
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
