import logging
import os

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.schemas.chatbot import (
    ExplainRequest,
    TTSRequest,
    WordExplainResponse,
    AskRequest,
    AskResponse,
)
from app.services.chatbot.audio_service import tts_generate
from app.services.chatbot.word_explainer import explain_word_from_question
from app.services.chatbot.chat_service import ask_linda
from app.services.rag.ingestion import ingest_all_stories
from app.utils.audio import speech_to_text

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


@router.post("/tts", response_class=Response)
async def tts_api(body: TTSRequest):
    """
    TTS endpoint sử dụng proxy Pinkyne.
    Nhận vào text, trả về audio/mp3 bytes.
    """
    logger.info("Received TTS request: text_len=%d", len(body.text))

    audio_bytes = await tts_generate(text=body.text)

    if audio_bytes is None:
        logger.error("TTS generation failed or returned no audio.")
        raise HTTPException(
            status_code=502,
            detail="TTS service failed or returned no audio",
        )

    logger.info("Returning TTS audio response: len=%d", len(audio_bytes))

    return Response(content=audio_bytes, media_type="audio/mpeg")


@router.get("/tts")
async def tts_test():
    return {"message": "GET OK"}


@router.post("/ask", response_model=AskResponse)
async def ask_chatbot(body: AskRequest):
    """
    Ask Linda with RAG context from stories.
    """
    logger.info("RAG ask received: %s", body.question)
    answer = ask_linda(body.question)
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
