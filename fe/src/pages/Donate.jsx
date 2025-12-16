import React from 'react';

const Donate = () => {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 className="grid-page-title">Donate - Ủng hộ dự án</h2>
      <p style={{ textAlign: 'center', marginBottom: '32px', opacity: 0.8 }}>
        Link góp ý tưởng: <a href="https://forms.gle/your-form-link" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-yellow-dark)' }}>https://forms.gle/your-form-link</a>
      </p>
      <img 
        src="/src/assets/Donate.jpg" 
        alt="Mã QR Donate" 
        style={{ 
          width: '300px', 
          height: '300px', 
          border: '1px solid rgba(0,0,0,0.1)', 
          borderRadius: '8px', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
        }} 
      />
      <p style={{ textAlign: 'center', marginTop: '24px', opacity: 0.8 }}>
        Donate đi please! 
      </p>
    </div>
  );
};

export default Donate;