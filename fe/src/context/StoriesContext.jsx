// src/context/StoriesContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const mockStories = [
  // Các story cũ giữ nguyên
  {
    id: 1,
    title: "Cô bé Lọ Lem",
    description: "Câu chuyện về cô gái mồ côi với đôi giày thủy tinh kỳ diệu...",
    image: "https://picsum.photos/id/1015/800/600",
    pdf: null, // Không có PDF cho mock cũ
  },
  {
    id: 2,
    title: "Nàng Bạch Tuyết",
    description: "Nàng công chúa xinh đẹp với làn da trắng như tuyết...",
    image: "https://picsum.photos/id/1019/800/600",
    pdf: null,
  },
  {
    id: 3,
    title: "Cô bé quàng khăn đỏ",
    description: "Hành trình của cô bé đáng yêu với chiếc khăn đỏ...",
    image: "https://picsum.photos/id/1039/800/600",
    pdf: null,
  },
  {
    id: 4,
    title: "Nàng tiên cá",
    description: "Câu chuyện tình yêu của nàng tiên cá dưới đại dương...",
    image: "https://picsum.photos/id/1049/800/600",
    pdf: null,
  },
  // Thêm truyện mới từ PDF
  {
    id: 5,
    title: "Con Không Có Miệng",
    description: "Truyện vui nhộn về nhân vật không có miệng ở thị trấn Lúc Búc...",
    image: "/assets/covers/con-khong-co-mieng.jpg", 
    pdf: "/stories/822.100.pdf", 
  },
  {
    id: 6,
    title: "Xoài Ngon Xoài Ngọt",
    description: "Hành trình từ hạt xoài đến cây xanh tươi, dạy trẻ về thiên nhiên ...",
    image: "/assets/covers/xoai-ngon-xoai-ngot.jpg", 
  },
  {
    id: 7,
    title: "Thả Diều Bay",
    description: "Câu chuyện vui về thả diều trên bãi biển...",
    image: "/assets/covers/tha-dieu-bay.jpg",
    pdf: "/stories/823.100.pdf",
  },
  {
    id: 8,
    title: "The Adventures of Chaddi Head",
    description: "Phiêu lưu của cậu bé siêu anh hùng với chiếc quần lót trên đầu...",
    image: "/assets/covers/chaddi-head.jpg", 
    pdf: "/stories/2168.100.pdf",
  },
  {
    id: 9,
    title: "Xoài Ngon Xoài Ngọt (Phiên Bản 2)",
    description: "Biến thể của truyện xoài, dạy về sự phát triển của cây cối ...",
    image: "/assets/covers/xoai-ngon-xoai-ngot-2.jpg", 
    pdf: "/stories/191.100.pdf",
  },
];

export const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [stories] = useState(mockStories);
  const [readStories, setReadStories] = useState([]);

  useEffect(() => {
    if (user) {
      const storedRead = JSON.parse(localStorage.getItem('readStories')) || [];
      setReadStories(storedRead);
    } else {
      setReadStories([]);
    }
  }, [user]);

  const markAsRead = (storyId) => {
    if (!user) return;
    const updatedRead = [...new Set([...readStories, storyId])];
    setReadStories(updatedRead);
    localStorage.setItem('readStories', JSON.stringify(updatedRead));
  };

  return (
    <StoriesContext.Provider value={{ stories, readStories, markAsRead }}>
      {children}
    </StoriesContext.Provider>
  );
};