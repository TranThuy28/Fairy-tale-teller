import { useState, useRef, useEffect, forwardRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './ReadingPage.css';
import pageTurnSound from '/assets/page-turn.mp3';
import { StoriesContext } from './context/StoriesContext';
import { explainWord, speechToText, askQuestion } from './utils/api';
import { FaMicrophone, FaStop } from 'react-icons/fa';

const API_BASE = 'http://127.0.0.1:8000/api';
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
    </div>
  );
});

Page.displayName = 'Page';

function ReadingPage() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const { stories, markAsRead } = useContext(StoriesContext);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showResumeOverlay, setShowResumeOverlay] = useState(false);
  const bookRef = useRef();
  const audioRef = useRef(null);
  const ttsRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    init();
    audioRef.current = new Audio(pageTurnSound);
    audioRef.current.volume = 0.5;

    // Mark as read if story exists
    if (filename && stories.length > 0) {
      const story = stories.find(s => s.pdf === filename);
      if (story) {
        markAsRead(story.id);
      }
    }
  }, [filename, stories]);

  const init = async () => {
    try {
      let target = filename;
      if (!target) {
        // Fetch first pdf from backend
        const res = await fetch(`${API_BASE}/stories`);
        const data = await res.json();
        if (!data || data.length === 0) {
          setError('Không tìm thấy truyện nào từ backend.');
          setLoading(false);
          return;
        }
        target = data[0];
      }
      const encoded = encodeURIComponent(target);
      const url = `${API_BASE}/stories/${encoded}`;
      setPdfFile(url);
      await loadPDF(url);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadPDF = async (pdfPath) => {
    try {
      setLoading(true);
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

  const stopTTS = () => {
    if (ttsRef.current) {
      ttsRef.current.pause();
      ttsRef.current.currentTime = 0;
      URL.revokeObjectURL(ttsRef.current.src);
      ttsRef.current = null;
    }
    setIsReading(false);
  };

  const startRecording = async () => {
    try {
      stopTTS();
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        try {
          const text = await speechToText(blob);
          if (text) {
            setChatInput(text);
            sendChat(text); // Auto-send after recording
          }
        } catch (err) {
          console.error('STT Error:', err);
        }
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Microphone access error:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const readCurrentPage = async () => {
    if (!pdfFile) return;
    stopTTS();
    setIsReading(true);
    try {
      const encoded = encodeURIComponent(filename || pdfFile.split('/').pop());
      const pageIndexes = [currentPage, currentPage + 1].filter(
        (p) => p >= 0 && p < totalPages
      );

      const allSegments = [];
      for (const p of pageIndexes) {
        const adjusted = Math.max(0, p - 1); // shift back by 1, backend is zero-based
        const textRes = await fetch(`${API_BASE}/stories/${encoded}/text?page=${adjusted}`);
        if (!textRes.ok) continue;
        const { segments = [] } = await textRes.json();
        allSegments.push(...segments);
      }

      const text = allSegments.join(' ');
      if (!text || text.length < 2) {
        throw new Error('Trang trống hoặc chỉ có hình ảnh.');
      }
      const ttsRes = await fetch(`${API_BASE}/chatbot/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!ttsRes.ok) {
        throw new Error('TTS backend lỗi.');
      }
      const segmentsAudio = await ttsRes.json(); // [{audio, text, speaker, voice}]
      if (!Array.isArray(segmentsAudio) || segmentsAudio.length === 0) {
        setIsReading(false);
        return;
      }

      let idx = 0;
      const playNext = () => {
        if (idx >= segmentsAudio.length) {
          setIsReading(false);
          return;
        }
        const seg = segmentsAudio[idx];
        const audioSrc = `data:audio/mp3;base64,${seg.audio}`;
        const audio = new Audio(audioSrc);
        ttsRef.current = audio;
        audio.onended = () => {
          idx += 1;
          playNext();
        };
        audio.onerror = (e) => {
          console.error('Audio playback error', e);
          idx += 1;
          playNext();
        };
        audio.play().catch((e) => {
          console.error('Audio play() failed', e);
          if (e && e.name === 'NotAllowedError') {
            setShowResumeOverlay(true);
          }
          // Do not advance idx; wait for user to resume
        });
      };

      playNext();
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: err.message }]);
      setIsReading(false);
    }
  };

  const sendChat = async (manualQuestion = null) => {
    const q = typeof manualQuestion === 'string' ? manualQuestion : chatInput.trim();
    if (!q) return;
    
    if (typeof manualQuestion !== 'string') setChatInput('');
    
    setChatMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setChatLoading(true);
    stopTTS();
    try {
      // Use askQuestion instead of explainWord for smarter RAG responses, scoped by filename if available
      const storyFilename = filename || (pdfFile ? decodeURIComponent(pdfFile.split('/').pop()) : null);
      const answer = await askQuestion(q, storyFilename);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: answer }]);

      // Auto TTS (best effort, no toast on block)
      try {
        const ttsRes = await fetch(`${API_BASE}/chatbot/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: answer }),
        });
        if (ttsRes.ok) {
          const segmentsAudio = await ttsRes.json();
          if (Array.isArray(segmentsAudio) && segmentsAudio.length > 0) {
            let idx = 0;
            const playNext = () => {
              if (idx >= segmentsAudio.length) return;
              const seg = segmentsAudio[idx];
              const audioSrc = `data:audio/mp3;base64,${seg.audio}`;
              const audio = new Audio(audioSrc);
              ttsRef.current = audio;
              audio.onended = () => {
                idx += 1;
                playNext();
              };
              audio.play().catch((e) => {
                if (e && e.name === 'NotAllowedError') {
                  setShowResumeOverlay(true);
                }
              });
            };
            playNext();
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'bot', text: 'Có lỗi, thử lại sau nhé!' }]);
    } finally {
      setChatLoading(false);
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
    stopTTS();
    setCurrentPage(e.data);
    playPageTurnSound();
  };

  const goToNextPage = () => {
    if (bookRef.current) {
      stopTTS();
      bookRef.current.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (bookRef.current) {
      stopTTS();
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const goToPage = (pageNum) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().turnToPage(pageNum);
    }
  };

  const goToFirstPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().turnToPage(0);
    }
  };

  const goToLastPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().turnToPage(totalPages - 1);
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
        <button onClick={() => init()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="reading-page">
      {/* AUTOPLAY RESUME OVERLAY */}
      {showResumeOverlay && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <p className="text-amber-300 text-3xl font-bold mb-8 font-serif drop-shadow-lg">
              📖 Audio is Ready!
            </p>
            <button
              onClick={() => {
                const audioEl = document.querySelector('audio');
                if (audioEl) {
                  audioEl.play().then(() => setShowResumeOverlay(false)).catch((err) => {
                    console.error("Resume audio failed", err);
                  });
                } else if (ttsRef.current) {
                  ttsRef.current.play().then(() => setShowResumeOverlay(false)).catch((err) => {
                    console.error("Resume audio failed", err);
                  });
                } else {
                  setShowResumeOverlay(false);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 px-12 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.6)] text-2xl border-4 border-emerald-400 transition-transform transform hover:scale-105 active:scale-95"
            >
              ▶ TAP TO LISTEN
            </button>
          </div>
        </div>
      )}
      <div className="book-container">
        <HTMLFlipBook
          ref={bookRef}
          width={450}
          height={600}
          size="stretch"
          minWidth={315}
          maxWidth={800}
          minHeight={400}
          maxHeight={1200}
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
      
      {/* Chat with Linda (RAG) */}
      {!isChatOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsChatOpen(true)}>
          <span role="img" aria-label="chat">💬</span> Hỏi cô Linda
        </button>
      )}

      <div className={`chat-panel ${isChatOpen ? 'open' : 'closed'}`}>
        <div className="chat-header">
          <h3>Hỏi cô Linda về trang này</h3>
          <button className="close-chat-btn" onClick={() => setIsChatOpen(false)} aria-label="Close chat">
            ×
          </button>
        </div>
        
        <button className="read-btn" onClick={readCurrentPage} disabled={isReading}>
          {isReading ? 'Đang đọc...' : 'Đọc to trang hiện tại (TTS)'}
        </button>
        <div className="chat-messages">
          {chatMessages.map((m, idx) => (
            <div key={idx} className={`chat-msg ${m.sender === 'user' ? 'user' : 'bot'}`}>
              {m.text}
            </div>
          ))}
          {chatLoading && (
            <div className="chat-msg bot thinking">
              Cô đang suy nghĩ
            </div>
          )}
        </div>
        <div className="chat-input">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendChat();
            }}
          />
          <button 
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Dừng ghi âm" : "Ghi âm câu hỏi"}
          >
            {isRecording ? <FaStop /> : <FaMicrophone />}
          </button>
          <button onClick={sendChat} disabled={chatLoading}>Gửi</button>
        </div>
      </div>
      
      <div className="controls">
        <button onClick={goToFirstPage} disabled={currentPage === 0}>
          First
        </button>
        <button onClick={goToPrevPage} disabled={currentPage === 0}>
          Previous
        </button>
        <span className="page-info">
          {getPageDisplay()}
        </span>
        <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>
          Next
        </button>
        <button onClick={goToLastPage} disabled={currentPage >= totalPages - 1}>
          Last
        </button>
      </div>
    </div>
  );
}

export default ReadingPage;
