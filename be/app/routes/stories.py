import os
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
import pdfplumber
import re
import shutil
from app.services.rag.ingestion import ingest_file

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
                raise HTTPException(status_code=404, detail="Page not found")
            
            p = pdf.pages[page]
            text = p.extract_text()
            if not text:
                return {"text": "", "segments": []}
            
            # Simple segmentation by newline or period
            # For a real app, use a better sentence tokenizer (e.g. nltk or spacy)
            lines = text.split('\n')
            segments = [line.strip() for line in lines if line.strip()]
            
            return {"text": text, "segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stories/upload")
async def upload_story(file: UploadFile = File(...)):
    """
    Upload a new PDF story and ingest it into the vector store.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Ensure directory exists
    STORIES_DIR.mkdir(parents=True, exist_ok=True)
    
    file_path = STORIES_DIR / file.filename
    
    # Save the file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
        
    # Ingest the file
    try:
        pages_ingested = ingest_file(file_path)
    except Exception as e:
        # If ingestion fails, log it but return success for upload
        print(f"Ingestion failed for {file.filename}: {e}")
        return {
            "filename": file.filename, 
            "status": "saved_but_ingestion_failed", 
            "detail": str(e)
        }

    return {
        "filename": file.filename, 
        "status": "uploaded_and_ingested", 
        "pages_ingested": pages_ingested
    }


@router.post("/upload")
async def upload_story(file: UploadFile = File(...)):
    """
    Upload a new PDF story and ingest it into the vector store.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Ensure stories directory exists
    STORIES_DIR.mkdir(parents=True, exist_ok=True)

    file_path = STORIES_DIR / file.filename
    
    # Save the file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Ingest the file
    pages_ingested = ingest_file(file_path)
        
    return {
        "filename": file.filename,
        "message": "File uploaded successfully",
        "pages_ingested": pages_ingested
    }

