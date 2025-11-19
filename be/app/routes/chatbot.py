from fastapi import APIRouter
from app.schemas.chatbot import ExplainRequest, WordExplainResponse
from app.services.chatbot.word_explainer import explain_word_from_question

router = APIRouter()

@router.post("/word-explain", response_model=WordExplainResponse)
def explain_word_route(request: ExplainRequest):
    text = explain_word_from_question(request.question)
    return WordExplainResponse(text=text, audio_url=None)
