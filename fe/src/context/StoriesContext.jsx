import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const mockStories = [
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