import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";

// Suppress noisy pdf.js warnings
const consoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === "string" && args[0].includes("getOperatorList")) return;
  consoleWarn(...args);
};

// Set up PDF.js worker - use local worker file compatible with Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const API_BASE_URL = "http://127.0.0.1:8000/api";

function FlipBookViewer() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoReading, setIsAutoReading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const audioRef = useRef(null);
  const placeholderRef = useRef(null);
  const flipBookRef = useRef(null);
  const queueCancelRef = useRef(false);

  useEffect(() => {
    if (filename) {
      loadPdf();
    }
  }, [filename]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      const encodedFilename = encodeURIComponent(filename);
      const url = `${API_BASE_URL}/stories/${encodedFilename}`;
      setPdfUrl(url);
    } catch (err) {
      setError(err.message);
      console.error("Error loading PDF:", err);
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    setError("Failed to load PDF: " + error.message);
    setLoading(false);
  };

  const primePlaceholder = () => {
    try {
      const placeholder = new Audio();
      placeholderRef.current = placeholder;
      placeholder.play().catch(() => {});
    } catch (err) {
      // ignore
    }
  };

  const goToPrevPage = () => {
    if (flipBookRef.current) {
      stopAudio();
      primePlaceholder();
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const goToNextPage = () => {
    if (flipBookRef.current) {
      stopAudio();
      primePlaceholder();
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const handlePageFlip = (e) => {
    stopAudio();
    primePlaceholder();
    setCurrentPage(e.data);
    const visible = getVisiblePages(e.data, numPages);
    console.log(`📖 Flip Detected. Index: ${e.data} -> Reading Spread: ${visible}`);
    fetchSegmentsForVisiblePages(visible);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
      setIsPlaying(false);
    }
    // Clear any queued playback
    queueCancelRef.current = true;
    setShowPlayButton(false);
  };

  // Multi-segment audio queue using /tts (now returns JSON list)
  const playSegment = async (segmentText) => {
    if (!segmentText || segmentText.trim().length < 2) {
      return;
    }
    try {
      stopAudio();
      queueCancelRef.current = false;
      const ttsRes = await fetch(`${API_BASE_URL}/chatbot/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: segmentText }),
      });

      if (!ttsRes.ok) {
        console.warn("Failed to fetch TTS audio", ttsRes.statusText);
        return;
      }

      const segmentsAudio = await ttsRes.json(); // [{audio, text, speaker, voice}]
      if (!Array.isArray(segmentsAudio) || segmentsAudio.length === 0) return;

      let idx = 0;
      const playNext = () => {
        if (queueCancelRef.current) {
          setIsPlaying(false);
          return;
        }
        if (idx >= segmentsAudio.length) {
          setIsPlaying(false);
          // advance highlight after finishing the set
          setCurrentSegmentIndex((prev) => prev + 1);
          return;
        }
        const seg = segmentsAudio[idx];
        const audioSrc = `data:audio/mp3;base64,${seg.audio}`;
        const audio = placeholderRef.current || new Audio();
        audio.src = audioSrc;
        audioRef.current = audio;
        setIsPlaying(true);
        audio.onended = () => {
          idx += 1;
          playNext();
        };
        audio.play().catch((err) => {
          console.log("Audio play blocked, showing overlay", err);
          if (err && err.name === "NotAllowedError") {
            setShowPlayButton(true);
            console.log("Autoplay blocked. Showing Overlay:", true);
            // Do not advance idx; wait for user to resume
            return;
          }
          idx += 1;
          playNext();
        });
      };

      playNext();
    } catch (err) {
      console.error("Segment play failed:", err);
    }
  };

  // 1. LOGIC: Calculate EXACT PDF Page Numbers (1-based)
  // Index 0 (Cover) -> PDF Page 1
  // Index 1 (Left)  -> PDF Page 2
  // Index 2 (Right) -> PDF Page 3
  const getVisiblePages = useCallback((currentIndex, total) => {
    if (currentIndex == null || total == null) return [];

    // CASE 0: Cover
    if (currentIndex === 0) return [1];

    // CASE SPREAD
    // Formula: Start from Page 2, add 2 for every spread block.
    const spreadBlock = Math.floor((currentIndex - 1) / 2);
    const leftPdfPage = 2 + spreadBlock * 2;
    const rightPdfPage = leftPdfPage + 1;

    const visiblePages = [leftPdfPage, rightPdfPage];

    // Filter: Page must be <= Total Pages
    return visiblePages.filter((p) => p > 0 && p <= total);
  }, []);

  // 2. LOGIC: Fetch Text (DO NOT ADD +1 HERE)
  const fetchSegmentsForVisiblePages = async (visiblePages) => {
    if (!filename || !visiblePages || visiblePages.length === 0) return;
    try {
      const encodedFilename = encodeURIComponent(filename);
      const combined = [];

      for (const p of visiblePages) {
        // p is already the correct PDF page number (1-based from getVisiblePages)
        console.log(`📡 Fetching Text for PDF Page: ${p}`);
        const apiPage = p - 1; // backend expects zero-based
        if (apiPage < 0) continue;

        const textRes = await fetch(
          `${API_BASE_URL}/stories/${encodedFilename}/text?page=${apiPage}`
        );

        if (!textRes.ok) {
          console.warn("Failed to fetch page text", textRes.statusText);
          continue;
        }

        const { segments: segs = [] } = await textRes.json();
        combined.push(...segs);
      }

      setSegments(combined);
      setCurrentSegmentIndex(0);

      // Auto-play first segment if enabled
      if (isAutoReading && combined.length > 0) {
        await playSegment(combined[0]);
      }
    } catch (err) {
      console.error("Fetch segments failed:", err);
      setSegments([]);
    }
  };

  // Auto read on page change
  useEffect(() => {
    if (!pdfUrl || numPages == null) return;
    stopAudio();
    const visible = getVisiblePages(currentPage, numPages);
    fetchSegmentsForVisiblePages(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isAutoReading, pdfUrl, numPages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !pdfUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
          </div>
          <p className="text-amber-100 text-xl font-serif">Opening the magical book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
        <div className="text-center text-amber-100">
          <p className="text-2xl font-serif mb-4">✨ Something went wrong ✨</p>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-50 rounded-lg font-serif transition-colors shadow-lg"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 py-8 px-4">
      {/* AUDIO RESUME OVERLAY - Must be outside FlipBook to be visible */}
      {showPlayButton && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center animate-bounce">
            <p className="text-white text-2xl font-bold mb-4 font-serif">✨ Audio is Ready! ✨</p>
            <button
              onClick={() => {
                setShowPlayButton(false);
                if (audioRef.current) {
                  audioRef.current.play().catch((err) => {
                    console.error("Resume audio failed", err);
                  });
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.8)] text-xl border-4 border-amber-300 transition-transform transform hover:scale-110"
            >
              ▶ TAP TO LISTEN
            </button>
          </div>
        </div>
      )}
      {/* DEBUG BAR - remove when stable */}
      <div className="fixed top-0 left-0 z-[9999] bg-black/80 text-green-400 p-2 font-mono text-sm max-w-md pointer-events-none">
        <p>Flip Index: {currentPage}</p>
        <p>Đang gọi PDF Page: {JSON.stringify(getVisiblePages(currentPage, numPages))}</p>
        <p>File: {filename}</p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-amber-800/80 hover:bg-amber-700 text-amber-50 rounded-lg font-serif transition-all shadow-lg backdrop-blur-sm flex items-center gap-2"
      >
        <span>←</span>
        <span>Back to Library</span>
      </button>

      {/* Book Container */}
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        {/* Warm Lighting Effect */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)" }}></div>

        {/* Book Viewer */}
        <div className="relative" style={{ perspective: "2000px" }}>
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center text-amber-100">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="font-serif">Loading pages...</p>
                </div>
              }
            >
              {numPages && (
                <div className="book-wrapper">
                  <HTMLFlipBook
                    ref={flipBookRef}
                    width={600}
                    height={800}
                    minWidth={400}
                    maxWidth={800}
                    minHeight={600}
                    maxHeight={1200}
                    maxShadowOpacity={0.8}
                    showCover={true}
                    mobileScrollSupport={true}
                    onFlip={handlePageFlip}
                    className="flipbook-container"
                  >
                  {/* Render each PDF page as a flipbook page */}
                  {Array.from({ length: numPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <div
                        key={pageNumber}
                        className="page"
                        style={{
                          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                          backgroundImage: `
                            repeating-linear-gradient(
                              0deg,
                              transparent,
                              transparent 2px,
                              rgba(139, 69, 19, 0.03) 2px,
                              rgba(139, 69, 19, 0.03) 4px
                            ),
                            radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)
                          `,
                          padding: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          boxShadow: "inset 0 0 20px rgba(139, 69, 19, 0.1)",
                          border: "1px solid rgba(139, 69, 19, 0.2)",
                        }}
                      >
                        {/* Ornamental Border */}
                        <div
                          className="absolute inset-4 border-2 border-amber-800/20 rounded"
                          style={{
                            borderStyle: "double",
                            borderWidth: "3px",
                          }}
                        ></div>

                        {/* Page Content */}
                        <div className="pdf-page-wrapper">
                          <Page
                            pageNumber={pageNumber}
                            width={520}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="pdf-page-inner"
                          />
                        </div>

                        {/* Page Number */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-amber-700/60 font-serif text-sm">
                          {pageNumber}
                        </div>
                      </div>
                    );
                  })}
                  </HTMLFlipBook>
                </div>
              )}
            </Document>
          )}
        </div>

        {/* Navigation Controls */}
        {numPages && (
        <div className="mt-8 flex items-center gap-6 flex-wrap justify-center">
          <button
            onClick={() => {
              stopAudio();
              setIsAutoReading((prev) => !prev);
            }}
            className={`px-4 py-2 rounded-lg font-serif transition-all shadow-lg backdrop-blur-sm flex items-center gap-2 text-base ${
              isAutoReading
                ? "bg-emerald-700/80 hover:bg-emerald-600 text-emerald-50"
                : "bg-slate-700/80 hover:bg-slate-600 text-slate-100"
            }`}
          >
            {isAutoReading ? "Auto Read: On" : "Auto Read: Off"}
          </button>

            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="px-6 py-3 bg-amber-800/80 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-50 rounded-lg font-serif transition-all shadow-lg backdrop-blur-sm flex items-center gap-2 text-xl"
            >
              <span>←</span>
              <span>Previous</span>
            </button>

            <div className="text-amber-100 font-serif text-lg px-4">
              Page {currentPage + 1} of {numPages}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages - 1}
              className="px-6 py-3 bg-amber-800/80 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-50 rounded-lg font-serif transition-all shadow-lg backdrop-blur-sm flex items-center gap-2 text-xl"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Karaoke-style text display */}
        {segments.length > 0 && (
          <div className="mt-6 max-w-4xl text-center text-amber-50 font-serif leading-relaxed space-y-2 px-4">
            {segments.map((seg, idx) => (
              <span
                key={idx}
                className={`inline-block text-lg transition-all ${
                  idx === currentSegmentIndex ? "highlight" : "text-amber-100/80"
                }`}
              >
                {seg + " "}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles for FlipBook */}
      <style>{`
        /* Book wrapper with deep shadow for physical depth */
        .book-wrapper {
          margin: 0 auto;
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.6),
            0 15px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        }
        
        .flipbook-container {
          margin: 0 auto;
        }
        
        .flipbook-container .page {
          background-color: #fef3c7;
          border: 1px solid rgba(139, 69, 19, 0.3);
          overflow: visible !important;
        }
        
        .flipbook-container .page-shadow {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
        }
        
        /* PDF Page Wrapper - ensures proper sizing */
        .pdf-page-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 0;
          overflow: visible;
        }
        
        /* React-PDF Page Container */
        .pdf-page-inner {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        /* React-PDF Canvas - CRITICAL for visibility */
        .pdf-page-inner .react-pdf__Page {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        .pdf-page-inner .react-pdf__Page__canvas {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain;
          margin: 0 auto;
        }
        
        /* Hide text and annotation layers to prevent layout issues */
        .pdf-page-inner .react-pdf__Page__textContent,
        .pdf-page-inner .react-pdf__Page__annotations {
          display: none !important;
        }
        
        /* Ensure page container has proper dimensions */
        .flipbook-container .page {
          position: relative;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

export default FlipBookViewer;

