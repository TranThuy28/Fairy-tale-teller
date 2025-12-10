// src/pages/SignIn.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Đảm bảo import này

const SignIn = () => {
  const { signIn } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // Lấy theme
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      signIn(email, password);
      navigate('/');
    } catch (err) {
      setError('Đăng nhập thất bại. Kiểm tra email/mật khẩu.');
    }
  };

  // Styles động dựa trên theme
  const bgColor = theme === 'light' ? '#f0f0f0' : '#121212';
  const formBg = theme === 'light' ? 'white' : '#1e1e1e';
  const textColor = theme === 'light' ? '#333' : '#e0e0e0';
  const labelColor = theme === 'light' ? '#555' : '#bbb';
  const inputBg = theme === 'light' ? 'white' : '#333';
  const inputBorder = theme === 'light' ? '#ddd' : '#555';
  const buttonBg = theme === 'light' ? '#007bff' : '#4a90e2';
  const buttonHoverBg = theme === 'light' ? '#0056b3' : '#357abd';

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: bgColor, 
        padding: '20px' 
      }} 
      className={theme}
    >
      <div 
        className="form-container" 
        style={{ 
          maxWidth: '400px', 
          width: '100%', 
          padding: '32px', 
          background: formBg, 
          borderRadius: '12px', 
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)', 
          animation: 'fadeIn 0.5s ease-in-out' 
        }}
      >
        <h2 style={{ textAlign: 'center', color: textColor, marginBottom: '24px', fontSize: '1.8rem' }}>ĐĂNG NHẬP</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: labelColor, marginBottom: '6px' }}>TÊN ĐĂNG NHẬP/EMAIL</label>
          <input 
            type="email" 
            placeholder="Nhập email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '12px', 
              marginBottom: '20px', 
              border: `1px solid ${inputBorder}`, 
              borderRadius: '6px', 
              fontSize: '1rem', 
              background: inputBg, 
              color: textColor, 
              transition: 'border-color 0.3s' 
            }}
            onFocus={(e) => e.target.style.borderColor = buttonBg}
            onBlur={(e) => e.target.style.borderColor = inputBorder}
          />
          <label style={{ display: 'block', fontSize: '0.85rem', color: labelColor, marginBottom: '6px' }}>MẬT KHẨU</label>
          <input 
            type="password" 
            placeholder="Nhập mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '12px', 
              marginBottom: '24px', 
              border: `1px solid ${inputBorder}`, 
              borderRadius: '6px', 
              fontSize: '1rem', 
              background: inputBg, 
              color: textColor, 
              transition: 'border-color 0.3s' 
            }}
            onFocus={(e) => e.target.style.borderColor = buttonBg}
            onBlur={(e) => e.target.style.borderColor = inputBorder}
          />
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: buttonBg, 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontSize: '1rem', 
              transition: 'background 0.3s, transform 0.2s' 
            }}
            onMouseEnter={(e) => { e.target.style.background = buttonHoverBg; e.target.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.target.style.background = buttonBg; e.target.style.transform = 'scale(1)'; }}
          >
            ĐĂNG NHẬP
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', color: theme === 'light' ? '#666' : '#aaa', fontSize: '0.9rem' }}>
          <Link 
            to="/forgot-password" 
            style={{ color: buttonBg, textDecoration: 'none', transition: 'color 0.3s' }} 
            onMouseEnter={(e) => e.target.style.color = buttonHoverBg} 
            onMouseLeave={(e) => e.target.style.color = buttonBg}
          >
            Quên mật khẩu?
          </Link> | 
          <Link 
            to="/signup" 
            style={{ color: buttonBg, textDecoration: 'none', transition: 'color 0.3s' }} 
            onMouseEnter={(e) => e.target.style.color = buttonHoverBg} 
            onMouseLeave={(e) => e.target.style.color = buttonBg}
          >
            {' '}Đăng ký tài khoản
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;