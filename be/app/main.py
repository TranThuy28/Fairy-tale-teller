import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chatbot import router as chatbot_router
from app.routes.stories import router as stories_router


# Basic logging config so that our module loggers (TTS, routes, etc.) show up
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)
logger.info("Starting Storybook AI application.")

app = FastAPI(title="Storybook AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],  # Cho phép mọi domain gọi
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép GET, POST, PUT, DELETE...
    allow_headers=["*"],  # Cho mọi header
)
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(stories_router, prefix="/api", tags=["Stories"])
