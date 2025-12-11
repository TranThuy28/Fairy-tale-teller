from fastapi import FastAPI
from app.routes.chatbot import router as chatbot_router
from app.routes.auth import router as auth_router
from app.db import init_db
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
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])


# Initialize DB
init_db()
