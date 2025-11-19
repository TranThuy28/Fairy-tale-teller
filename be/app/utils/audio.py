from openai import OpenAI
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Init client
client = OpenAI(api_key=OPENAI_API_KEY)


# ============================
# TEXT → SPEECH (TTS)
# ============================
def text_to_speech(text: str, voice: str = "alloy") -> bytes:
    """
    Convert text to audio (mp3).
    Returns raw audio bytes.
    """
    response = client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text
    )
    return response.read()



# ============================
# SPEECH → TEXT (STT)
# ============================
def speech_to_text(file_path: str) -> str:
    """
    Convert speech audio file to text.
    file_path: path đến file audio (.wav, .mp3, .webm)
    Trả về text string.
    """
    with open(file_path, "rb") as f:
        response = client.audio.transcriptions.create(
            model="whisper-1",   
            file=f
        )

    return response.text.strip()
