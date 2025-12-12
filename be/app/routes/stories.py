import os
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import pdfplumber
import re

router = APIRouter()

# Path to stories directory
STORIES_DIR = Path(__file__).parent.parent.parent / "data" / "stories"


@router.get("/stories", response_model=List[str])
async def list_stories():
    """
    List all available PDF story files.
    Returns a list of filenames.
    """
    if not STORIES_DIR.exists():
        return []

    pdf_files = [
        f.name
        for f in STORIES_DIR.iterdir()
        if f.is_file() and f.suffix.lower() == ".pdf"
    ]

    return sorted(pdf_files)


@router.get("/stories/{filename}")
async def get_story(filename: str):
    """
    Serve a specific PDF story file.
    """
    # Security: prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = STORIES_DIR / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Story not found")

    if file_path.suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="File is not a PDF")

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=filename,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
        },
    )


@router.get("/stories/{filename}/text")
async def get_story_text(filename: str, page: int = Query(0, ge=0)):
    """
    Extract text from a specific page of the PDF using pdfplumber.
    page: zero-based page index.
    Returns segments (sentences) for karaoke/highlighting.
    """
    # Security: prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = STORIES_DIR / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Story not found")

    if file_path.suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="File is not a PDF")

    try:
        with pdfplumber.open(str(file_path)) as pdf:
            if page < 0 or page >= len(pdf.pages):
                raise HTTPException(status_code=404, detail="Page out of range")

            pdf_page = pdf.pages[page]
            raw_text = pdf_page.extract_text() or ""
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {exc}")

    # Clean text: collapse whitespace/newlines
    cleaned = " ".join(raw_text.split())

    # Split into sentences using regex
    sentences = [
        s.strip()
        for s in re.split(r"(?<=[.!?])\s+", cleaned)
        if s.strip()
    ]

    return {"segments": sentences, "page": page}

