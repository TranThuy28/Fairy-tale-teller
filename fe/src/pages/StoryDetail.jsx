import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoriesContext } from '../context/StoriesContext';
import { ThemeContext } from '../context/ThemeContext';
import { Document, Page, pdfjs } from 'react-pdf'; 
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import StoryCover from '../components/StoryCover';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StoryDetail = () => {
  const { id } = useParams(); 
  const { stories, markAsRead, readStories } = useContext(StoriesContext); 
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const story = stories.find(s => s.id === parseInt(id));
  const [numPages, setNumPages] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const suggestedStories = stories.filter(s => !readStories.includes(s.id) && s.id !== parseInt(id)).slice(0, 4); 

  useEffect(() => {
    if (story) {
      markAsRead(story.id);
      setLoading(false); 
    }
  }, [story]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  if (!story) return <div style={{ textAlign: 'center', padding: '40px' }}>Nopeeeee.</div>;

  const bgColor = theme === 'light' ? '#FFD580' : '#121212'; 
  const textColor = theme === 'light' ? '#333' : '#e0e0e0';
  const buttonBg = theme === 'light' ? '#FF8C00' : '#4a90e2';
  const pdfBg = theme === 'light' ? '#FFF3E0' : '#1e1e1e'; 
  const pdfBorder = theme === 'light' ? '#E0A070' : '#555'; 
  const cardBg = theme === 'light' ? '#FFF3E0' : '#1e1e1e'; 
  const cardBorder = theme === 'light' ? '#E0A070' : '#555';

  return (
    <div 
      style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, padding: '40px' }} 
      className="fade-in"
    >
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '8px 16px', background: buttonBg, color: 'white', border: 'none' }}>Quay Lại</button>
      
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto', 
        display: 'flex', 
        gap: '24px', 
        flexDirection: 'row' 
      }}>
        <div style={{ flex: '1 1 70%', maxWidth: '70%' }}>
          <h1 className="slide-in">{story.title}</h1> 
          <img 
            src={story.image} 
            alt={story.title} 
            style={{ 
              width: '100%', 
              height: '400px', 
              objectFit: 'cover', 
              marginBottom: '20px', 
              transition: 'transform 0.3s ease, box-shadow 0.3s ease' 
            }} 
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'; }} 
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }} 
          />
          <p className="fade-in">{story.description}</p>
          {story.pdf && (
            <div style={{ marginTop: '20px', border: `1px solid ${pdfBorder}`, padding: '10px', background: pdfBg }}>
              <h3>Nội dung truyện (PDF):</h3>
              {loading ? (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <div className="spinner" />
                  <p>Đang tải PDF...</p>
                </div>
              ) : (
                <Document file={story.pdf} onLoadSuccess={onDocumentLoadSuccess}>
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page 
                      key={`page_${index + 1}`} 
                      pageNumber={index + 1} 
                      renderTextLayer={false} 
                      renderAnnotationLayer={false} 
                      className="fade-in" 
                    />
                  ))}
                </Document>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ 
          flex: '1 1 30%', 
          maxWidth: '30%', 
          background: cardBg, 
          border: `1px solid ${cardBorder}`, 
          borderRadius: '8px', 
          padding: '16px', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          animation: 'fade-in 0.5s ease-out' 
        }}>
          <h3 style={{ marginBottom: '16px', color: textColor }}>Đề xuất</h3>
          {suggestedStories.length === 0 ? (
            <p style={{ color: textColor, opacity: 0.8 }}>Không có truyện gợi ý. Bạn đã đọc hết!</p>
          ) : (
            suggestedStories.map(suggest => (
              <div 
                key={suggest.id} 
                style={{ 
                  marginBottom: '16px', 
                  borderBottom: `1px solid ${cardBorder}`, 
                  paddingBottom: '16px', 
                  cursor: 'pointer',
                  transition: 'background 0.3s ease' 
                }}
                onClick={() => navigate(`/story/${suggest.id}`)} 
                onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'light' ? '#f0f0f0' : '#2a2a2a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <img 
                  src={suggest.image} 
                  alt={suggest.title} 
                  style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} 
                />
                <h4 style={{ fontSize: '1rem', color: textColor, marginBottom: '4px' }}>{suggest.title}</h4>
                <p style={{ fontSize: '0.8rem', color: theme === 'light' ? '#666' : '#aaa', lineHeight: '1.2' }}>
                  {suggest.description.slice(0, 80)}...
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;