import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import List, Union

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
            # Use absolute path to ensure persistence across restarts
            # Get project root (assuming we run from project root or be/ directory)
            base_dir = os.getcwd()
            
            # Use a separate folder for memory chroma to avoid conflict with RAG chroma
            # If running from project root: be/app/data/memory_chroma_db
            # If running from be/: app/data/memory_chroma_db
            if os.path.basename(base_dir) == "be":
                # Running from be/ directory
                memory_chroma_path = os.path.join(base_dir, "app", "data", "memory_chroma_db")
            else:
                # Running from project root
                memory_chroma_path = os.path.join(base_dir, "be", "app", "data", "memory_chroma_db")
            
            # Convert to absolute path and normalize
            memory_chroma_path = os.path.abspath(memory_chroma_path)
            
            # Create directory if it doesn't exist
            os.makedirs(memory_chroma_path, exist_ok=True)
            
            print(f"🧠 Memory Storage Path (Chroma): {memory_chroma_path}")
            logger.info("Mem0 Storage Path (ChromaDB, absolute): %s", memory_chroma_path)

            config = {
                "vector_store": {
                    "provider": "chroma",  # Switch to ChromaDB for better local persistence
                    "config": {
                        "collection_name": "story_memory",
                        "path": memory_chroma_path,
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
            logger.info("Initialized mem0 Memory for StoryMemory (ChromaDB) at %s", memory_chroma_path)
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
            search_output = self.client.search(query=query, user_id=user_id)
            
            print(f"DEBUG: Raw Mem0 search output: {search_output}")
            logger.debug("Mem0 search returned: type=%s", type(search_output).__name__)
            
            # 1. Normalize the output to a List
            if isinstance(search_output, dict):
                # Extract from {'results': [...]}
                results_list = search_output.get("results", [])
                logger.debug("Extracted 'results' key from dict, found %d items", len(results_list))
            elif isinstance(search_output, list):
                results_list = search_output
                logger.debug("Search output is already a list with %d items", len(results_list))
            else:
                results_list = []
                logger.warning("Unexpected search output type: %s", type(search_output).__name__)
            
            if not results_list:
                logger.debug("No memories found for query: %s", query)
                return ""
            
            # 2. Extract text strings from the list items
            texts = []
            for idx, m in enumerate(results_list):
                logger.debug("Processing result[%d]: type=%s", idx, type(m).__name__)
                
                if isinstance(m, dict):
                    # Mem0 item structure: {'memory': 'Text content', ...} or {'text': ...}
                    content = m.get("memory", m.get("text", ""))
                    if content:
                        texts.append(str(content).strip())
                        logger.debug("Extracted from dict: %s", str(content)[:50])
                elif isinstance(m, str):
                    if m.strip():
                        texts.append(m.strip())
                        logger.debug("Added string directly: %s", m[:50])
            
            print(f"DEBUG: Extracted memory texts: {texts}")
            logger.debug("Final memory texts count: %d", len(texts))
            
            # Join texts with newlines and return
            result = "\n".join(texts)
            logger.debug("Final memories text (len=%d): %s", len(result), result[:200])
            
            return result
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
