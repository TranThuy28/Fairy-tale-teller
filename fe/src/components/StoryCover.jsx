import React from 'react';
import { Document, Page } from 'react-pdf';

const StoryCover = ({ story, width = '100%', height = 'auto' }) => {  
  if (!story || !story.pdf) {
    return <div style={{ width, height, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Cover</div>; 
  }
  return (
    <div style={{ width, height, overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <Document file={story.pdf}>
        <Page 
          pageNumber={1}  
          width={parseInt(width) || 800}  
          renderTextLayer={false}  
          renderAnnotationLayer={false} 
        />
      </Document>
    </div>
  );
};

export default StoryCover;