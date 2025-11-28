import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ColorThief from "colorthief";
import "./MainPage.css";

const slides = [
  {
    id: 1,
    title: "Cô bé Lọ Lem",
    description: "Câu chuyện về cô gái mồ côi với đôi giày thủy tinh kỳ diệu...",
    image: "https://picsum.photos/id/1015/800/600",
  },
  {
    id: 2,
    title: "Nàng Bạch Tuyết",
    description: "Nàng công chúa xinh đẹp với làn da trắng như tuyết...",
    image: "https://picsum.photos/id/1019/800/600",
  },
  {
    id: 3,
    title: "Cô bé quàng khăn đỏ",
    description: "Hành trình của cô bé đáng yêu với chiếc khăn đỏ...",
    image: "https://picsum.photos/id/1039/800/600",
  },
  {
    id: 4,
    title: "Nàng tiên cá",
    description: "Câu chuyện tình yêu của nàng tiên cá dưới đại dương...",
    image: "https://picsum.photos/id/1049/800/600",
  },
];

function MainPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bgColor, setBgColor] = useState("#4a6b8a");
  const imageRefs = useRef([]);
  const colorThief = useRef(new ColorThief());

  // Extract color from image when it loads
  const handleImageLoad = (index, img) => {
    try {
      const color = colorThief.current.getColor(img);
      // Store color for this slide
      imageRefs.current[index] = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      // Update background if this is the current slide
      if (index === selectedIndex) {
        setBgColor(imageRefs.current[index]);
      }
    } catch (e) {
      console.log("Could not extract color", e);
    }
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);

    // Update background color if we have extracted color for this slide
    if (imageRefs.current[index]) {
      setBgColor(imageRefs.current[index]);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index);

  return (
    <div className="main-page" style={{ backgroundColor: bgColor }}>
      <h1 className="title">✨ Fairy Tale Teller ✨</h1>

      <div className="carousel-wrapper">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((slide, index) => (
              <div className="embla__slide" key={slide.id}>
                <div className="slide-card">
                  <div className="slide-image">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      crossOrigin="anonymous"
                      onLoad={(e) => handleImageLoad(index, e.target)}
                    />
                  </div>
                  <div className="slide-info">
                    <h2>{slide.title}</h2>
                    <p>{slide.description}</p>
                    <button className="view-button">XEM THÔNG TIN</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === selectedIndex ? "active" : ""}`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;