import logging
from functools import lru_cache
from pathlib import Path

import chromadb
import requests
from chromadb import EmbeddingFunction, Documents, Embeddings

from app.core.config import settings

logger = logging.getLogger(__name__)


class PinkyneEmbeddingFunction(EmbeddingFunction):
    """
    Custom embedding function that calls the Pinkyne/Yunwu proxy for embeddings.
    """

    def __call__(self, input: Documents) -> Embeddings:
        url = f"{settings.pinkyne_base_url}/embeddings"
        headers = {
            "Authorization": f"Bearer {settings.pinkyne_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "text-embedding-3-small",
            "input": input,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        embeddings = [item["embedding"] for item in data.get("data", [])]
        return embeddings


class VectorStore:
    """
    Singleton wrapper around ChromaDB for persistent vector storage.
    """

    def __init__(self) -> None:
        base_path = Path(__file__).parent.parent.parent / "data" / "chroma_db"
        base_path.mkdir(parents=True, exist_ok=True)

        logger.info("Initializing ChromaDB at %s", base_path)
        self.client = chromadb.PersistentClient(path=str(base_path))

        embedding_fn = PinkyneEmbeddingFunction()

        self.collection: chromadb.Collection = self.client.get_or_create_collection(
            name="fairy_tales",
            embedding_function=embedding_fn,
        )


@lru_cache
def get_vector_store() -> VectorStore:
    return VectorStore()



