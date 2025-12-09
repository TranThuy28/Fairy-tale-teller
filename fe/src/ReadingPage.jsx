import React, { useState } from "react";
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

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function goToPrevPage() {
    if (pageNumber === 1) return; // Can't go before cover
    if (pageNumber === 2) {
      setPageNumber(1); // Go back to cover
    } else {
      setPageNumber((prev) => Math.max(prev - 2, 2)); // Move back 2 pages
    }
  }

  function goToNextPage() {
    if (pageNumber === 1) {
      setPageNumber(2); // From cover to first spread
    } else {
      setPageNumber((prev) => Math.min(prev + 2, numPages));
    }
  }

  // Check if we're on the cover page
  const isCover = pageNumber === 1;
  // Check if we can go to next/previous
  const canGoNext = pageNumber < numPages;
  const canGoPrev = pageNumber > 1;

  return (
    <div className="reading-page">
      <div className="pdf-controls">
        <button onClick={goToPrevPage} disabled={!canGoPrev}>
          ‹ Previous
        </button>
        <span>
          {isCover ? 'Cover' : `Pages ${pageNumber}-${Math.min(pageNumber + 1, numPages)}`}
        </span>
        <button onClick={goToNextPage} disabled={!canGoNext}>
          Next ›
        </button>
      </div>

      <div className={`pdf-container ${isCover ? 'single-page' : 'spread-view'}`}>
        {isCover ? (
          // Show only cover page
          <Document
            file="/assets/Little-Prince-final-text.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div>Loading PDF...</div>}
          >
            <div className="page-wrapper cover">
              <Page pageNumber={1} />
            </div>
          </Document>
        ) : (
          // Show two pages side by side
          <>
            <Document
              file="/assets/Little-Prince-final-text.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div>Loading PDF...</div>}
            >
              <div className="page-wrapper left-page">
                <Page pageNumber={pageNumber} />
              </div>
            </Document>
            {pageNumber + 1 <= numPages && (
              <Document
                file="/assets/Little-Prince-final-text.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <div className="page-wrapper right-page">
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