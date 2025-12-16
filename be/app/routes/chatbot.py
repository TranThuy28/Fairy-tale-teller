import logging
import os

from fastapi import APIRouter, File, HTTPException, UploadFile, BackgroundTasks
from fastapi.responses import Response

from app.schemas.chatbot import (
    ExplainRequest,
    TTSRequest,
    WordExplainResponse,
    AskRequest,
    AskResponse,
)
from app.services.chatbot.audio_service import tts_generate
from app.services.chatbot.audio_director import generate_multi_voice_audio
from app.services.chatbot.word_explainer import explain_word_from_question
from app.services.chatbot.chat_service import ask_linda
from app.services.rag.ingestion import ingest_all_stories
from app.utils.audio import speech_to_text
from app.services.memory.memory_service import get_story_memory

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/word-explain", response_model=WordExplainResponse)
def explain_word_route(request: ExplainRequest):
    text = explain_word_from_question(request.question)
    return WordExplainResponse(text=text, audio_url=None)


@router.post("/stt")
async def stt_api(file: UploadFile = File(...)):
    # Tạo folder temp nếu chưa có
    os.makedirs("temp", exist_ok=True)

    file_path = f"temp/{file.filename}"

    # Lưu file upload
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Chuyển speech → text
    text = speech_to_text(file_path)

    return {"transcription": text}


@router.post("/tts")
async def tts_api(body: TTSRequest):
    """
    Multi-character TTS: parse script, assign voices, return list of base64 segments.
    Response: [{speaker, voice, audio, text}]
    """
    logger.info("Received TTS request (multi-voice): text_len=%d", len(body.text))
    segments = await generate_multi_voice_audio(body.text)
    if not segments:
        raise HTTPException(
            status_code=502,
            detail="TTS multi-voice failed or returned no audio",
        )
    # Rename key 'audio_b64' to 'audio' to match requested schema
    result = [
        {
          "speaker": seg.get("speaker"),
          "voice": seg.get("voice"),
          "audio": seg.get("audio_b64"),
          "text": seg.get("text"),
        }
        for seg in segments
    ]
    return result


@router.get("/tts")
async def tts_test():
    return {"message": "GET OK"}


@router.post("/ask", response_model=AskResponse)
async def ask_chatbot(body: AskRequest, background_tasks: BackgroundTasks):
    """
    Ask Linda with RAG context from stories + long-term memory.
    """
    user_id = "child_user_default"
    memory = get_story_memory()
    memories_text = ""
    try:
        memories_text = memory.get_memories(user_id, body.question) or ""
    except Exception:
        memories_text = ""

    logger.info(
        "RAG ask received: %s (filename=%s) with memories_len=%d",
        body.question,
        body.filename or body.current_story,
        len(memories_text),
    )
    answer = ask_linda(
        body.question,
        filename=body.filename or body.current_story,
        memories_text=memories_text,
    )

    # Persist new memories in background (non-blocking)
    try:
        background_tasks.add_task(memory.add_memory, user_id, body.question)
        background_tasks.add_task(memory.add_memory, user_id, answer)
    except Exception:
        pass

    return AskResponse(answer=answer)


@router.post("/index")
async def trigger_ingestion():
    """
    Trigger ingestion of all stories into ChromaDB.
    """
    pages = ingest_all_stories()
    return {"ingested_pages": pages}


@router.post("/ingest")
async def ingest_endpoint():
    """
    Trigger ingestion of all stories into ChromaDB (alias).
    """
    pages = ingest_all_stories()
    return {"ingested_pages": pages}
