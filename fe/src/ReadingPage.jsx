import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./ReadingPage.css";

// Set up the worker - match versions
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function ReadingPage() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('');
  const audioRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function playFlipSound() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  }

  function goToPrevPage() {
    if (pageNumber === 1) return;
    
    setIsFlipping(true);
    setFlipDirection('prev');
    playFlipSound();
    
    setTimeout(() => {
      if (pageNumber === 2) {
        setPageNumber(1);
      } else {
        setPageNumber((prev) => Math.max(prev - 2, 2));
      }
      
      setTimeout(() => {
        setIsFlipping(false);
        setFlipDirection('');
      }, 100);
    }, 600);
  }

  function goToNextPage() {
    if (pageNumber >= numPages) return;
    
    setIsFlipping(true);
    setFlipDirection('next');
    playFlipSound();
    
    setTimeout(() => {
      if (pageNumber === 1) {
        setPageNumber(2);
      } else {
        setPageNumber((prev) => Math.min(prev + 2, numPages));
      }
      
      setTimeout(() => {
        setIsFlipping(false);
        setFlipDirection('');
      }, 100);
    }, 600);
  }

  const isCover = pageNumber === 1;
  const canGoNext = pageNumber < numPages;
  const canGoPrev = pageNumber > 1;

  return (
    <div className="reading-page">
      <audio ref={audioRef} src="/assets/page-turn.mp3" preload="auto" />
      
      <div className="pdf-controls">
        <button onClick={goToPrevPage} disabled={!canGoPrev || isFlipping}>
          ‹ Previous
        </button>
        <span>
          {isCover ? 'Cover' : `Pages ${pageNumber}-${Math.min(pageNumber + 1, numPages)}`}
        </span>
        <button onClick={goToNextPage} disabled={!canGoNext || isFlipping}>
          Next ›
        </button>
      </div>

      <div className={`pdf-container ${isCover ? 'single-page' : 'spread-view'} ${isFlipping ? 'flipping' : ''}`}>
        {isCover ? (
          <Document
            file="/assets/Little-Prince-final-text.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div>Loading PDF...</div>}
          >
            <div className={`page-wrapper cover ${flipDirection === 'next' ? 'flip-next' : ''}`}>
              <Page pageNumber={1} />
            </div>
          </Document>
        ) : (
          <>
            <Document
              file="/assets/Little-Prince-final-text.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div>Loading PDF...</div>}
            >
              <div className={`page-wrapper left-page ${flipDirection === 'prev' ? 'flip-prev' : ''}`}>
                <Page pageNumber={pageNumber} />
              </div>
            </Document>
            {pageNumber + 1 <= numPages && (
              <Document
                file="/assets/Little-Prince-final-text.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <div className={`page-wrapper right-page ${flipDirection === 'next' ? 'flip-next' : ''}`}>
                  <Page pageNumber={pageNumber + 1} />
                </div>
              </Document>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ReadingPage;