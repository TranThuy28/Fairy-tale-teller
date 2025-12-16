import React, { useContext } from 'react';
import { StoriesContext } from '../context/StoriesContext';
import { useNavigate } from 'react-router-dom';

const ReadStories = () => {
  const { stories, readStories } = useContext(StoriesContext);
  const filteredStories = stories.filter(story => readStories.includes(story.id));
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="content-container">
        <h2 className="grid-page-title">Đã Đọc</h2>
        {filteredStories.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa đọc truyện nào.</p>
            <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '16px' }}>Quay Về Trang Chủ</button>
          </div>
        ) : (
          <div className="stories-grid">
            {filteredStories.map(story => (
              <div key={story.id} className="story-card" onClick={() => navigate(`/reading/${story.pdf}`)}>
                <div className="story-image-wrapper">
                  <img src={story.image} alt={story.title} loading="lazy" />
                </div>
                <div className="story-info">
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-description">{story.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadStories;