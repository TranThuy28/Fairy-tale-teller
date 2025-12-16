import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StoriesContext } from '../context/StoriesContext';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const { stories } = useContext(StoriesContext);
  const [filteredStories, setFilteredStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase();
      const results = stories.filter(story => 
        story.title.toLowerCase().includes(lowerQuery) || 
        story.description.toLowerCase().includes(lowerQuery)
      );
      setFilteredStories(results);
    } else {
      setFilteredStories([]);
    }
  }, [query, stories]);

  return (
    <div className="page-container">
      <div className="content-container">
        <h2 className="grid-page-title">Kết quả tìm kiếm cho "{query}"</h2>
        {filteredStories.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy truyện nào phù hợp.</p>
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

export default SearchPage;

