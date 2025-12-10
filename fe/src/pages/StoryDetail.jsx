import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoriesContext } from '../context/StoriesContext';

const StoryDetail = () => {
  const { id } = useParams(); 
  const { stories, markAsRead } = useContext(StoriesContext);
  const navigate = useNavigate();
  const story = stories.find(s => s.id === parseInt(id));

  useEffect(() => {
    if (story) markAsRead(story.id);
  }, [story]);

  if (!story) return <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>Truyện không tồn tại.</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#333', color: 'white', padding: '40px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none' }}>Quay Lại</button>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>{story.title}</h1>
        <img src={story.image} alt={story.title} style={{ width: '100%', height: '400px', objectFit: 'cover', marginBottom: '20px' }} />
        <p>{story.description} (Nội dung đầy đủ mock: Đây là nội dung chi tiết của truyện...)</p>
      </div>
    </div>
  );
};

export default StoryDetail;