from typing import List, Optional

from app.core.vector_store import get_vector_store


def query_story_context(question: str, top_k: int = 3, filename: Optional[str] = None) -> List[str]:
    """
    Retrieve the most relevant chunks for a question.
    Optionally filter by source filename metadata.
    Returns a list of chunk texts.
    """
    vs = get_vector_store()
    collection = vs.collection

    where = {"source": filename} if filename else None

    results = collection.query(
        query_texts=[question],
        n_results=top_k,
        where=where,
    )

    documents = results.get("documents", [[]])[0]

    try:
        print(f"DEBUG: Retrieved {len(results['documents'][0])} chunks for query: {question} (filename={filename})")
        if results["documents"][0]:
            print(f"DEBUG: Top chunk content: {results['documents'][0][0][:100]}...")
    except Exception:
        pass

    return documents or []



