import React, { useContext } from 'react';
import { StoriesContext } from '../context/StoriesContext';

const UnreadStories = () => {
  const { stories, readStories, markAsRead } = useContext(StoriesContext);
  const filteredStories = stories.filter(story => !readStories.includes(story.id));

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f0f0f0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem', color: '#333' }}>Truyện Chưa Đọc</h2>
      {filteredStories.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', fontSize: '1.2rem', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <p>Bạn đã đọc hết truyện.</p>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '16px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px' }}>Quay Về Trang Chủ</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredStories.map(story => (
            <div key={story.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
              background: 'white',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; }}
            >
              <img src={story.image} alt={story.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', color: '#333' }}>{story.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden' }}>{story.description}</p>
                <button onClick={() => markAsRead(story.id)} style={{ 
                  padding: '10px 20px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'background 0.3s, transform 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.background = '#0056b3'; e.target.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.target.style.background = '#007bff'; e.target.style.transform = 'scale(1)'; }}
                >
                  Đánh Dấu Đã Đọc
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnreadStories;