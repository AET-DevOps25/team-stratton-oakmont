import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>TUM Study Planner</h1>
        </Link>
      </div>
      <div className="navbar-menu">
        {isLoggedIn ? (
          <div className="profile-menu">
            <button 
              className="profile-icon" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              👤
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleProfileClick} className="dropdown-item">
                  View Profile
                </button>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">
              <button className="navbar-button">Log In</button>
            </Link>
            <Link to="/signup">
              <button className="navbar-button">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;