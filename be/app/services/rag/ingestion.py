import logging
from pathlib import Path
from typing import List

import pdfplumber

from app.core.vector_store import get_vector_store

logger = logging.getLogger(__name__)


def ingest_all_stories() -> int:
    """
    Ingest all PDF stories into ChromaDB.
    Each page is treated as a single chunk with metadata: source, page_number.
    Returns number of pages ingested.
    """
    current_file = Path(__file__).resolve()
    project_root = current_file.parent.parent.parent.parent  # go up to 'be' folder
    stories_dir = project_root / "data" / "stories"
    if not stories_dir.exists():
        logger.warning("Stories directory does not exist: %s", stories_dir)
        return 0

    vs = get_vector_store()
    collection = vs.collection

    ingested = 0

    for pdf_file in stories_dir.glob("*.pdf"):
        # Skip if already indexed by simple filename check
        existing = collection.get(
            where={"source": pdf_file.name},
            limit=1,
        )
        if existing and existing.get("ids"):
            logger.info("Skipping already indexed file: %s", pdf_file.name)
            continue

        logger.info("Indexing %s", pdf_file.name)
        try:
            with pdfplumber.open(str(pdf_file)) as pdf:
                documents: List[str] = []
                metadatas: List[dict] = []
                ids: List[str] = []

                for page_idx, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    # Clean whitespace
                    text = " ".join(text.split())
                    print(f"DEBUG: Extracting {pdf_file.name} - Page {page_idx}: Found {len(text)} characters.")
                    if len(text) < 10:
                        print("WARNING: Page seems empty or is an image!")
                    if not text:
                        logger.warning("WARNING: Skipped %s page %d due to empty text.", pdf_file.name, page_idx)
                        continue
                    doc_id = f"{pdf_file.name}-page-{page_idx}"
                    documents.append(text)
                    ids.append(doc_id)
                    metadatas.append(
                        {
                            "source": pdf_file.name,
                            "page_number": page_idx,
                        }
                    )

                if documents:
                    collection.add(documents=documents, metadatas=metadatas, ids=ids)
                    ingested += len(documents)
        except Exception as exc:
            logger.exception("Failed to index %s: %s", pdf_file.name, exc)
            continue

    logger.info("Ingestion complete. Pages ingested: %d", ingested)
    return ingested



