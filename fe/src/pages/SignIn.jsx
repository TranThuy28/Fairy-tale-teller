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

  return (
    <div className="auth-wrapper">
      <div className="auth-form-container">
        <h2 className="auth-title">ĐĂNG NHẬP</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">TÊN ĐĂNG NHẬP/EMAIL</label>
            <input 
              type="email" 
              placeholder="Nhập email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">MẬT KHẨU</label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            ĐĂNG NHẬP
          </button>
        </form>
        <p className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            Quên mật khẩu?
          </Link> | 
          <Link to="/signup" className="auth-link">
            {' '}Đăng ký tài khoản
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;