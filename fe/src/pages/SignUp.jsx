import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SignUp = () => {
  const { signUp } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      signUp(email, password);
      navigate('/');
    } catch (err) {
      setError('Đăng ký thất bại.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form-container">
        <h2 className="auth-title">ĐĂNG KÝ TÀI KHOẢN</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">EMAIL</label>
            <input 
              type="email" 
              placeholder="Nhập email của bạn" 
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
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            ĐĂNG KÝ NGAY
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;