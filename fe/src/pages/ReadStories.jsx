import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { StoriesContext } from '../context/StoriesContext';
import { ThemeContext } from '../context/ThemeContext'; 

const ReadStories = () => {
  const { stories, readStories } = useContext(StoriesContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate(); 
  const filteredStories = stories.filter(story => readStories.includes(story.id));

  const bgColor = theme === 'light' ? '#FFD580' : '#121212'; 
  const textColor = theme === 'light' ? '#333' : '#e0e0e0';
  const cardBg = theme === 'light' ? '#FFF3E0' : '#1e1e1e'; 
  const cardBorder = theme === 'light' ? '#E0A070' : '#555'; 
  const cardShadow = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const buttonBg = theme === 'light' ? '#FF8C00' : '#4a90e2'; 
  const buttonHoverBg = theme === 'light' ? '#E07A00' : '#357abd'; 

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', backgroundColor: bgColor }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem', color: textColor }}>Đã Đọc</h2>
      {filteredStories.length === 0 ? (
        <div style={{ textAlign: 'center', color: textColor, fontSize: '1.2rem', padding: '40px', background: cardBg, borderRadius: '12px', boxShadow: `0 4px 8px ${cardShadow}` }}>
          <p>Bạn chưa đọc truyện nào.</p>
          <button onClick={() => window.location.href = '/'} style={{ background: buttonBg, color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Quay về Trang Chủ</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredStories.map(story => (
            <div key={story.id} style={{ 
              border: `1px solid ${cardBorder}`, 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: `0 4px 8px ${cardShadow}`, 
              background: cardBg,
              transition: 'transform 0.3s, box-shadow 0.3s' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 8px 16px ${cardShadow}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 4px 8px ${cardShadow}`; }}
            >
              <img src={story.image} alt={story.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', color: textColor }}>{story.title}</h3>
                <p style={{ color: theme === 'light' ? '#636363' : '#bbb', fontSize: '0.9rem', lineHeight: '1.4', maxHeight: '60px', overflow: 'hidden' }}>{story.description}</p>
                <button 
                  style={{ 
                    marginTop: '12px', 
                    background: buttonBg, 
                    color: 'white', 
                    padding: '8px 16px', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontSize: '1rem', 
                    transition: 'background 0.3s, transform 0.2s' 
                  }} 
                  onClick={() => navigate(`/story/${story.id}`)} 
                  onMouseEnter={(e) => { e.target.style.background = buttonHoverBg; e.target.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.target.style.background = buttonBg; e.target.style.transform = 'scale(1)'; }}
                >
                  Xem lại
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadStories;