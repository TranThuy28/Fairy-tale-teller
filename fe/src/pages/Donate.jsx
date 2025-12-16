import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; 

const Donate = () => {
  const { theme } = useContext(ThemeContext); 

const bgColor = theme === 'light' ? '#FFD580' : '#121212'; // THAY ĐỔI
const textColor = theme === 'light' ? '#333' : '#e0e0e0';
const subTextColor = theme === 'light' ? '#666' : '#aaa';
const imgBorder = theme === 'light' ? '#E0A070' : '#555'; // THAY ĐỔI
const imgShadow = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: bgColor, 
      padding: '40px' 
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: textColor }}>Donate - Ủng Hộ Dự Án</h2>
      <p style={{ textAlign: 'center', marginBottom: '32px', color: subTextColor }}>
        Link góp ý tưởng: <a href="https://forms.gle/your-form-link" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'light' ? '#007bff' : '#4a90e2' }}>https://forms.gle/your-form-link</a>
      </p>
      <img 
        src="/src/assets/Donate.jpg" 
        alt="Mã QR Donate" 
        style={{ 
          width: '300px', 
          height: '300px', 
          border: `1px solid ${imgBorder}`, 
          borderRadius: '8px', 
          boxShadow: `0 4px 8px ${imgShadow}` 
        }} 
      />
      <p style={{ textAlign: 'center', marginTop: '24px', color: subTextColor }}>
        Donate đi please! 
      </p>
    </div>
  );
};

export default Donate;