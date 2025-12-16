import base64
import json
import logging
from typing import Dict, List, Optional

from openai import OpenAI

from app.core.config import settings
from app.services.chatbot.audio_service import tts_generate
from app.services.memory.memory_service import get_story_memory

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=settings.pinkyne_api_key,
    base_url=settings.pinkyne_base_url,
)


# Global voice assignment map to keep consistency per character within a session
character_voice_map: Dict[str, str] = {}


def assign_voice(speaker: str, gender: str = "", archetype: str = "") -> str:
    """
    Assign a voice for a speaker, keeping consistency across calls.
    """
    key = (speaker or "Narrator").strip().lower()
    if key in character_voice_map:
        return character_voice_map[key]

    gender_l = (gender or "").lower()
    arch_l = (archetype or "").lower()
    speaker_l = key

    # Narrator always alloy
    if key in ["narrator", "voiceover", "đọc truyện"]:
        voice = "alloy"
    elif "child" in arch_l or "kid" in arch_l or "bé" in speaker_l or "con" in speaker_l:
        voice = "nova"
    elif "female" in gender_l or "girl" in speaker_l:
        voice = "nova"
    elif "villain" in arch_l or "ác" in speaker_l or "wolf" in speaker_l:
        voice = "onyx"
    elif "old" in arch_l or "wise" in arch_l or "grand" in speaker_l:
        voice = "fable"
    elif "male" in gender_l:
        voice = "echo"
    else:
        voice = "alloy"

    character_voice_map[key] = voice
    return voice


def parse_script(text: str) -> List[Dict[str, str]]:
    """
    Use LLM to parse raw text into segments with speaker metadata.
    Returns list of dicts: {text, speaker, gender, archetype}
    """
    # Optional: enrich with user voice/style preferences from memory
    voice_prefs = ""
    try:
        memory = get_story_memory()
        voice_prefs = memory.get_memories("child_user_default", "voice tone reading style") or ""
    except Exception:
        voice_prefs = ""

    prompt = f"""
You are a meticulous Audio Drama Director. Convert the story text into a JSON list.
CRITICAL RULE: You must include EVERY word from the source text. Do not summarize or skip narration tags like "he said", "she asked", "they replied".
- If a sentence contains both dialogue and narration, split them into separate items. Example:
  "I am strong," she said.
  -> {{"text": "I am strong,", "speaker": "Queen", "gender": "Female", "archetype": "Adult"}}
  -> {{"text": "she said.", "speaker": "Narrator", "gender": "Neutral", "archetype": "Adult"}}
- Narration, speech tags, and descriptions belong to "Narrator".
Each item must have: "text", "speaker" (name or "Narrator"), "gender" (Male/Female/Neutral), "archetype" (Child/Adult/Old/Villain).
Keep segments short (1-2 sentences).

User preferences about voice / tone / reading style (if any):
{voice_prefs}

Story:
{text}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a concise script segmenter."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        content = response.choices[0].message.content or ""
        content = content.strip()
        # Remove markdown code fences if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content
            if content.endswith("```"):
                content = content.rsplit("\n", 1)[0]
        segments = json.loads(content)
        if isinstance(segments, list):
            cleaned = []
            for seg in segments:
                if not isinstance(seg, dict):
                    continue
                cleaned.append(
                    {
                        "text": seg.get("text", "").strip(),
                        "speaker": seg.get("speaker", "Narrator").strip(),
                        "gender": seg.get("gender", "Neutral").strip(),
                        "archetype": seg.get("archetype", "Adult").strip(),
                    }
                )
            if cleaned:
                return cleaned
    except Exception as exc:
        logger.exception("Failed to parse script: %s", exc)

    # Fallback: single narrator segment
    return [{"text": text, "speaker": "Narrator", "gender": "Neutral", "archetype": "Adult"}]


async def generate_multi_voice_audio(text: str) -> List[Dict[str, str]]:
    """
    Parse text into segments, assign voices, synthesize TTS per segment.
    Returns list of {speaker, voice, audio_b64}.
    """
    segments = parse_script(text)
    outputs: List[Dict[str, str]] = []

    for seg in segments:
        seg_text = seg.get("text", "").strip()
        if not seg_text:
            continue
        voice = assign_voice(
            seg.get("speaker", "Narrator"),
            seg.get("gender", "Neutral"),
            seg.get("archetype", "Adult"),
        )
        audio_bytes = await tts_generate(seg_text, voice=voice)
        if not audio_bytes:
            continue
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        outputs.append(
            {
                "speaker": seg.get("speaker", "Narrator"),
                "voice": voice,
                "audio_b64": audio_b64,
                "text": seg_text,
            }
        )

    return outputs


