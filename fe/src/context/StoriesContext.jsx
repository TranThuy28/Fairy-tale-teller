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
  {
    id: 6,
    title: "Cinderella",
    description: "The protagonist is a young girl living in unfortunate circumstances who is suddenly blessed with remarkable fortune, ultimately ascending to the throne through ...",
    image: "https://salt.tikicdn.com/cache/750x750/media/catalog/product/1/6/16-princess-cinderella.u5430.d20170719.t165332.494990.jpg.webp",
    pdf: "Cinderella.pdf",
  },
  {
    id: 7,
    title: "Rapunzel",
    description: "Rapunzel is a classic fairy tale about a girl with magical, long golden hair, imprisoned in a tower by a witch (Dame Gothel) who uses her hair as a ladder to visit ...",
    image: "https://preview.redd.it/rapunzel-in-her-tower-9-16-to-give-it-space-v0-n1ofrrb1ecna1.png?width=640&crop=smart&auto=webp&s=eb7de366e52006f75599a300e9568d01344a5c09",
    pdf: "Rapunzel.pdf",
  },
  {
    id: 8,
    title: "The Little Mermaid",
    description: "The Little Mermaid by Hans Christian Andersen is a tragic fairy tale about a young mermaid princess who longs for a human soul and falls for a prince she rescues from a shipwreck",
    image: "https://images.squarespace-cdn.com/content/v1/5e01d4d4c4faa308239ed7b6/83d365e8-2e09-4126-be2b-ab477816e821/nRcBRec5Lq8qzV5MAkJGb956sPI.jpg",
    pdf: "The_little_mermaid.pdf",
  }
  
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