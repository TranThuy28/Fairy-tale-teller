from fastapi import FastAPI
from app.routes.chatbot import router as chatbot_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Storybook AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],   # Cho phép mọi domain gọi
    allow_credentials=True,
    allow_methods=["*"],   # Cho phép GET, POST, PUT, DELETE...
    allow_headers=["*"],   # Cho mọi header
)
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
