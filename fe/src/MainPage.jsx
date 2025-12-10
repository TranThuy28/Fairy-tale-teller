import React, { useContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoriesContext } from './context/StoriesContext'; 
import useEmblaCarousel from 'embla-carousel-react';
import "./MainPage.css";

function MainPage() {
  const context = useContext(StoriesContext); 
  if (!context) {
    return <div style={{ color: 'red', textAlign: 'center' }}>Error: StoriesContext not provided. Kiểm tra Provider trong App.jsx.</div>; // Check an toàn
  }
  const { stories } = context; 

  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  if (stories.length === 0) return <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="main-page">
      <h1 className="title">Trang Chủ - Danh Sách Truyện</h1>
      <div className="carousel-wrapper">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {stories.map((story, index) => (
              <div key={story.id} className="embla__slide">
                <div className="slide-card">
                  <div className="slide-image">
                    <img src={story.image} alt={story.title} />
                  </div>
                  <div className="slide-info">
                    <h2>{story.title}</h2>
                    <p>{story.description}</p>
                    <button className="view-button" onClick={() => navigate(`/story/${story.id}`)}>
                      Xem Thông Tin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dots">
          {stories.map((_, index) => (
            <button
              key={index}
              className={`dot ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;