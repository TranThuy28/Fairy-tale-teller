import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaUserCircle, FaBars, FaSun, FaMoon } from 'react-icons/fa'; 
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${theme}`}>
      <div className="navbar-left">
        <FaBars className="hamburger-icon" size={24} onClick={toggleMenu} />
        <div className={`menu ${isMenuOpen ? 'open fade-in' : ''}`}> 
          <Link to="/donate" className="navbar-link" onClick={toggleMenu}>Donate</Link>
          <Link to="/" className="navbar-link" onClick={toggleMenu}>Trang Chủ</Link>
          <Link to="/upload-story" className="navbar-link" onClick={toggleMenu}>Đăng Truyện</Link>
          {user && (
            <>
              <Link to="/read-stories" className="navbar-link" onClick={toggleMenu}>Truyện Đã Đọc</Link>
            </>
          )}
        </div>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Tìm kiếm truyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch size={20} color="white" />
              </button>
            </form>
            <button onClick={toggleTheme} className="theme-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {theme === 'light' ? <FaMoon size={20} color="white" /> : <FaSun size={20} color="white" />}
            </button>
            <div className="user-avatar" onClick={handleLogout}>
              <FaUserCircle size={30} color="white" />
              <span className="user-email">{user.email}</span>
            </div>
          </>
        ) : (
          <>
            <button onClick={toggleTheme} className="theme-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '16px' }}>
              {theme === 'light' ? <FaMoon size={20} color="white" /> : <FaSun size={20} color="white" />}
            </button>
            <Link to="/signup" className="navbar-link">Đăng Ký</Link>
            <Link to="/signin" className="navbar-link">Đăng Nhập</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;