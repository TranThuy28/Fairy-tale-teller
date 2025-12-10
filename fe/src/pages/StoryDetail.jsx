import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoriesContext } from '../context/StoriesContext';
import { Document, Page, pdfjs } from 'react-pdf'; // Import từ react-pdf
import Chatbot from '../components/Chatbot';

// Set worker cho PDF.js (thêm dòng này)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const StoryDetail = () => {
  const { id } = useParams(); 
  const { stories, markAsRead } = useContext(StoriesContext);
  const navigate = useNavigate();
  const story = stories.find(s => s.id === parseInt(id));
  const [numPages, setNumPages] = useState(null); // Để biết tổng trang PDF

  useEffect(() => {
    if (story) markAsRead(story.id);
  }, [story]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!story) return <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>Truyện không tồn tại.</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#333', color: 'white', padding: '40px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none' }}>Quay Lại</button>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>{story.title}</h1>
        <img src={story.image} alt={story.title} style={{ width: '100%', height: '400px', objectFit: 'cover', marginBottom: '20px' }} />
        <p>{story.description}</p>
        {/* Render PDF nếu có */}
        {story.pdf && (
          <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', background: 'white' }}>
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