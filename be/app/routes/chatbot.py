from fastapi import APIRouter
from app.schemas.chatbot import ExplainRequest, WordExplainResponse
from app.services.chatbot.word_explainer import explain_word_from_question
from app.utils.audio import text_to_speech, speech_to_text
from fastapi import UploadFile, File
from fastapi.responses import Response
import os
from app.schemas.chatbot import TTSRequest

router = APIRouter()

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
    audio = text_to_speech(body.text)
    return Response(content=audio, media_type="audio/mpeg")

@router.get("/tts")
async def tts_test():
    return {"message": "GET OK"}
