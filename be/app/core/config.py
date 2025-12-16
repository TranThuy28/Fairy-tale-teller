from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Main usage here is for the Pinkyne OpenAI proxy TTS configuration.
    """

    # Proxy TTS config
    pinkyne_base_url: str = "https://vip.pinkyne.com/v1"
    pinkyne_api_key: str

    openai_api_key: str | None = None

    # Default TTS params (can be overridden via env)
    tts_model: str = "gpt-4o-mini-tts"
    tts_voice: str = "alloy"

    # HTTP client config
    http_timeout: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> "Settings":
    return Settings()


settings = get_settings()








