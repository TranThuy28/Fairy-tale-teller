import { useState, useRef, useEffect, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './ReadingPage.css';
import pageTurnSound from '/assets/page-turn.mp3';
// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Page component for the flipbook
const Page = forwardRef(({ pageNumber, imageUrl, isCover, isBlank }, ref) => {
  if (isBlank) {
    return <div className="page blank-page" ref={ref}></div>;
  }
  
  return (
    <div className={`page ${isCover ? 'cover-page' : ''}`} ref={ref}>
      <div className="page-content">
        {imageUrl ? (
          <img src={imageUrl} alt={`Page ${pageNumber}`} />
        ) : (
          <div className="loading">Loading page {pageNumber}...</div>
        )}
      </div>
      {!isCover && (
        <div className="page-footer">
          <span className="page-number">{pageNumber}</span>
        </div>
      )}
    </div>
  );
});

Page.displayName = 'Page';

function ReadingPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const bookRef = useRef();
  const audioRef = useRef(null);
  useEffect(() => {
    loadPDF();
    audioRef.current = new Audio(pageTurnSound);
    audioRef.current.volume = 0.5;
  }, []);

  const loadPDF = async () => {
    try {
      setLoading(true);
      const pdfPath = '/assets/Little-Prince-final-text.pdf';
      
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(pdfPath);
      const pdf = await loadingTask.promise;
      
      setTotalPages(pdf.numPages);
      
      // Convert each page to an image
      const pageImages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL();
        pageImages.push({ pageNumber: i, imageUrl });
      }
      
      setPages(pageImages);
      setLoading(false);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const playPageTurnSound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset to start
        audioRef.current.play().catch(err => {
          console.log('Audio play failed:', err);
        });
      }
    };

  const onFlip = (e) => {
    setCurrentPage(e.data);
    playPageTurnSound();
  };

  const goToNextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const goToPage = (pageNum) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().turnToPage(pageNum);
    }
  };

  const getPageDisplay = () => {
    if (currentPage === 0) {
      return `1 / ${totalPages}`;
    }
    const leftPage = currentPage + 1;
    const rightPage = currentPage + 2;
    if (rightPage <= totalPages) {
      return `${leftPage}-${rightPage} / ${totalPages}`;
    }
    return `${leftPage} / ${totalPages}`;
  };

  if (loading) {
    return (
      <div className="reading-page loading-container">
        <div className="spinner"></div>
        <p>Loading your book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reading-page error-container">
        <h2>Error Loading PDF</h2>
        <p>{error}</p>
        <button onClick={loadPDF}>Retry</button>
      </div>
    );
  }

  return (
    <div className="reading-page">
      <div className="book-container" style={{ width: '60%', margin: '0 auto' }}>
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="flip-book"
          drawShadow={true}
          flippingTime={1000}
          usePortrait={false}
          startPage={0}
        >
          {pages.map((page, index) => {
            if (index === 0) {
              // First page is the cover
              return (
                <Page
                  key={page.pageNumber}
                  pageNumber={page.pageNumber}
                  imageUrl={page.imageUrl}
                  isCover={true}
                />
              );
            } else if (index === 1) {
              // Add a blank page after cover for proper spread alignment
              return [
                <Page key="blank" isBlank={true} />,
                <Page
                  key={page.pageNumber}
                  pageNumber={page.pageNumber}
                  imageUrl={page.imageUrl}
                />
              ];
            } else {
              // Regular pages
              return (
                <Page
                  key={page.pageNumber}
                  pageNumber={page.pageNumber}
                  imageUrl={page.imageUrl}
                />
              );
            }
          })}
        </HTMLFlipBook>
      </div>
      
      <div className="controls">
        <button onClick={goToPrevPage} disabled={currentPage === 0}>
          Previous
        </button>
        <span className="page-info">
          {getPageDisplay()}
        </span>
        <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default ReadingPage;
