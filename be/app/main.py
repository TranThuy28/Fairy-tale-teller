from fastapi import FastAPI
from app.routes.chatbot import router as chatbot_router

app = FastAPI(title="Storybook AI")

app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
