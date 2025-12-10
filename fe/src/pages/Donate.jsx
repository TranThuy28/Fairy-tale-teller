import React from 'react';

const Donate = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f0f0f0', 
      padding: '40px' 
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>Donate - Ủng Hộ Dự Án</h2>
      <p style={{ textAlign: 'center', marginBottom: '32px', color: '#666' }}>
        Link góp ý tưởng: <a href="https://forms.gle/your-form-link" target="_blank" rel="noopener noreferrer">https://forms.gle/your-form-link</a>
      </p>
      <img 
        src="/src/assets/Donate.jpg" 
        alt="Mã QR Donate" 
        style={{ 
          width: '300px', 
          height: '300px', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
        }} 
      />
      <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
        Donate đi please! 
      </p>
    </div>
  );
};

export default Donate;