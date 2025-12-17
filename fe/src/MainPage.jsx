import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoriesContext } from './context/StoriesContext'; 
import "./MainPage.css";
import goldenCloudImage from './assets/golden_cloud.jpg';

function MainPage() {
  const context = useContext(StoriesContext); 
  if (!context) {
    return <div style={{ color: 'red', textAlign: 'center' }}>Error: StoriesContext not provided. Kiểm tra Provider trong App.jsx.</div>; // Check an toàn
  }
  const { stories } = context; 

  const navigate = useNavigate();

  if (stories.length === 0) return <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>Loading...</div>;

  return (
    <div className="main-page">
      <div className="hero-section">
        <div className="hero-overlay-dark"></div>
        <div className="hero-content">
          <h1>Fairy Tale Teller</h1>
          <p>Lạc vào chốn thần tiên</p>
        </div>
        <img 
          src={goldenCloudImage} 
          alt="Library Hero" 
          className="hero-image"
        />
      </div>
      
      <div className="content-container">
        <h2 className="section-title">Danh sách truyện</h2>
        <div className="stories-grid">
          {stories.map((story) => (
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
      </div>
    </div>
  );
}

export default MainPage;