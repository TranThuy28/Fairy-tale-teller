import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaSearch, FaBell, FaUserCircle, FaBars, FaSun, FaMoon } from 'react-icons/fa'; 
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const notifications = ['Notification 1: New Story', 'Notification 2: Update'];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <FaBars className="hamburger-icon" size={24} onClick={toggleMenu} />
        <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/donate" className="navbar-link" onClick={toggleMenu}>Donate</Link>
          <Link to="/" className="navbar-link" onClick={toggleMenu}>Home</Link>
          <Link to="/upload-story" className="navbar-link" onClick={toggleMenu}>Upload Story</Link>
          {user && (
            <>
              <Link to="/read-stories" className="navbar-link" onClick={toggleMenu}>Read Stories</Link>
              <Link to="/unread-stories" className="navbar-link" onClick={toggleMenu}>Unread Stories</Link>
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
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch size={20} />
              </button>
            </form>
            <div ref={notificationsRef} className="notifications-container">
              <FaBell
                size={20}
                onClick={() => setShowNotifications(!showNotifications)}
                className="icon"
              />
              {showNotifications && (
                <div className="notifications-dropdown">
                  {notifications.map((notif, idx) => (
                    <p key={idx}>{notif}</p>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleTheme} className="theme-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {theme === 'light' ? <FaMoon size={20} className="icon" /> : <FaSun size={20} className="icon" />}
            </button>
            <div className="user-avatar" onClick={handleLogout}>
              <FaUserCircle size={30} className="icon" />
              <span className="user-email">{user.email}</span>
            </div>
          </>
        ) : (
          <>
            {/* Thêm toggle cho non-user */}
            <button onClick={toggleTheme} className="theme-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '16px' }}>
              {theme === 'light' ? <FaMoon size={20} className="icon" /> : <FaSun size={20} className="icon" />}
            </button>
            <Link to="/signup" className="navbar-link">Sign Up</Link>
            <Link to="/signin" className="navbar-link">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;