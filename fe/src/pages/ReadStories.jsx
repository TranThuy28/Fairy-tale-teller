import React, { useContext } from 'react';
import { StoriesContext } from '../context/StoriesContext';

const ReadStories = () => {
  const { stories, readStories } = useContext(StoriesContext);
  const filteredStories = stories.filter(story => readStories.includes(story.id));

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#d5d5d5ff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem', color: '#000000ff' }}>Đã Đọc</h2>
      {filteredStories.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#5c5c5cff', fontSize: '1.2rem', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <p>Bạn chưa đọc truyện nào.</p>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '16px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px' }}>Quay Về Trang Chủ</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredStories.map(story => (
            <div key={story.id} style={{ 
              border: '1px solid #502a2aff', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 8px rgba(140, 92, 92, 0.1)', 
              background: 'white',
              transition: 'transform 0.3s, box-shadow 0.3s' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; }}
            >
              <img src={story.image} alt={story.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', color: '#484848ff' }}>{story.title}</h3>
                <p style={{ color: '#636363ff', fontSize: '0.9rem', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden' }}>{story.description}</p> {/* Cắt description */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadStories;