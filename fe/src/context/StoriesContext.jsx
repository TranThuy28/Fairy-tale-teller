// src/context/StoriesContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getStories } from '../utils/api';

const mockStories = [
  {
    id: 1,
    title: "Annual Haircut Day",
    description: "Sringeri Srinivas has a very long day when he decides to get his annual haircut.",
    image: "https://i.ytimg.com/vi/f2DRj5gGZ7I/maxresdefault.jpg", 
    pdf: "annual_haircut_day.pdf",
  },
  {
    id: 2,
    title: "Con Không Có Miệng",
    description: "Truyện vui nhộn về nhân vật không có miệng ở thị trấn Lúc Búc.",
    image: "https://picsum.photos/id/1015/800/600", 
    pdf: "con_khong_co_mieng.pdf",
  },
  {
    id: 3,
    title: "The Adventures of Chaddi Head",
    description: "Phiêu lưu của cậu bé siêu anh hùng với chiếc quần lót thttpsrên đầu.",
    image: "https://static.storyweaver.org.in/illustration_crops/727187/size7/3f8eb125d159ff91718c5e2e27483e37.jpg",
    pdf: "the_adventures_of_chadi_head.pdf",
  },
  {
    id: 4,
    title: "Thị Trấn Diều Bay",
    description: "Câu chuyện về thị trấn nơi những cánh diều bay cao.",
    image: "https://picsum.photos/id/1039/800/600",
    pdf: "thi_tran_dieu_bay.pdf",
  },
  {
    id: 5,
    title: "Xoài Ngon Xoài Ngọt",
    description: "Hành trình từ hạt xoài đến cây xanh tươi, dạy trẻ về thiên nhiên.",
    image: "https://cdn.tgdd.vn/Files/2018/06/08/1093983/cac-loai-xoai-pho-bien-o-viet-nam-1.jpg",
    pdf: "xoai_ngon_xoai_ngot.pdf",
  },
];

export const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState(mockStories);
  const [readStories, setReadStories] = useState([]);

  const refreshStories = async () => {
    try {
      const filenames = await getStories();
      
      // Merge backend files with mock data
      const mergedStories = filenames.map((filename, index) => {
        // Check if we have metadata for this file in mockStories
        const existingStory = mockStories.find(s => s.pdf === filename);
        
        if (existingStory) {
          return existingStory;
        }
        
        // Create new story entry for uploaded files
        return {
          id: 1000 + index, // Generate ID for new files
          title: filename.replace('.pdf', '').replace(/_/g, ' '),
          description: "Truyện được tải lên từ người dùng.",
          image: "https://via.placeholder.com/300x400?text=PDF+Story", // Default placeholder
          pdf: filename,
          isUploaded: true
        };
      });
      
      setStories(mergedStories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      // Fallback to mock stories if backend fails
      setStories(mockStories);
    }
  };

  useEffect(() => {
    refreshStories();
  }, []);

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
    <StoriesContext.Provider value={{ stories, readStories, markAsRead, refreshStories }}>
      {children}
    </StoriesContext.Provider>
  );
};