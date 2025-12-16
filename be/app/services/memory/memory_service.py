import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import List

try:
    from mem0 import Memory as Mem0Memory
except ImportError:  # pragma: no cover - optional dependency
    Mem0Memory = None

logger = logging.getLogger(__name__)


class StoryMemory:
    """
    Thin wrapper around mem0.Memory with graceful degradation if mem0 is missing.
    """

    def __init__(self) -> None:
        self.client = None
        if Mem0Memory is None:
            logger.warning("mem0ai is not installed; StoryMemory will be disabled.")
            return

        try:
            storage_dir = Path(__file__).parent.parent.parent / "data" / "mem0_storage"
            storage_dir.mkdir(parents=True, exist_ok=True)

            config = {
                "vector_store": {
                    "provider": "qdrant",
                    "config": {
                        "path": str(storage_dir),  # local persistent store
                    },
                },
                "embedder": {
                    "provider": "huggingface",
                    "config": {
                        "model": "all-MiniLM-L6-v2",
                    },
                },
                "llm": {
                    "provider": "openai",
                    "config": {
                        "model": "gpt-4o-mini",
                        "api_key": os.getenv("PINKYNE_API_KEY") or os.getenv("OPENAI_API_KEY"),
                        "openai_base_url": os.getenv("PINKYNE_BASE_URL", "https://api.pinkyne.com/v1"),
                    },
                },
            }

            self.client = Mem0Memory.from_config(config)
            logger.info("Initialized mem0 Memory for StoryMemory at %s", storage_dir)
        except Exception as exc:
            logger.exception("Failed to initialize mem0 Memory: %s", exc)
            self.client = None

    def add_memory(self, user_id: str, text: str) -> None:
        if not self.client:
            return
        try:
            # mem0 expects a list of messages
            self.client.add(messages=[{"role": "user", "content": text}], user_id=user_id)
        except Exception as exc:
            logger.exception("Failed to add memory: %s", exc)

    def get_memories(self, user_id: str, query: str) -> str:
        """
        Search memories for a user and return a formatted string.
        """
        if not self.client:
            return ""
        try:
            results: List[dict] = self.client.search(query=query, user_id=user_id) or []
            if not results:
                return ""
            texts = [m.get("text", "") for m in results if m.get("text")]
            return "\n".join(texts)
        except Exception as exc:
            logger.exception("Failed to search memories: %s", exc)
            return ""

    def get_all_memories(self, user_id: str) -> List[dict]:
        if not self.client:
            return []
        try:
            return self.client.get_all(user_id=user_id) or []
        except Exception as exc:
            logger.exception("Failed to get all memories: %s", exc)
            return []


@lru_cache
def get_story_memory() -> StoryMemory:
    return StoryMemory()
