import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoriesContext } from '../context/StoriesContext';
import { Document, Page, pdfjs } from 'react-pdf'; 
import Chatbot from '../components/Chatbot';

// Set worker cho PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const StoryDetail = () => {
  const { id } = useParams(); 
  const { stories, markAsRead } = useContext(StoriesContext);
  const navigate = useNavigate();
  const story = stories.find(s => s.id === parseInt(id));
  const [numPages, setNumPages] = useState(null); 

  useEffect(() => {
    if (story) markAsRead(story.id);
  }, [story]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!story) return <div className="page-container" style={{ textAlign: 'center' }}>Truyện không tồn tại.</div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/')} className="back-button">Quay Lại</button>
      <div className="detail-content">
        <h1>{story.title}</h1>
        <img src={story.image} alt={story.title} className="detail-image" />
        <p className="detail-description">{story.description}</p>
        {/* Render PDF nếu có */}
        {story.pdf && (
          <div className="pdf-container">
            <h3>Nội dung truyện (PDF):</h3>
            <Document file={story.pdf} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} />
              ))}
            </Document>
          </div>
        )}
      </div>
      <Chatbot />
    </div>
  );
};

export default StoryDetail;