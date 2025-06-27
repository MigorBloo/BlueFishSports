import React from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    if (path === '/logout') {
      logout();
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const navItems = [
    { label: 'Welcome', path: '/tennis/welcome' },
    { label: 'Your Picks', path: '/tennis/selections' },
    { label: 'Results', path: '/tennis/results' },
    { label: 'Leaderboard', path: '/tennis/leaderboard' },
    { label: 'Tournaments', path: '/tennis/tournaments' },
    { label: 'Player Pool', path: '/tennis/player-pool'},
    { label: 'Scoring', path: '/tennis/scoring' },
    { label: 'Logout', path: '/logout' },
  ];

  return (
    <nav className="navigation-bar">
      <div className="toolbar">
        {/* Logo Section */}
        <Link to="/landing">
          <img
            src="/assets/images/games/tennis/Tennis.webp"
            alt="Tennis"
            className="nav-logo"
          />
        </Link>

        {/* User Profile Section */}
        <div 
          onClick={handleProfileClick}
          className="user-profile-section"
        >
          <div className="user-avatar">
              <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <span className="user-username">
            {user?.username || 'Guest'}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="nav-items-container">
          {navItems.map((item) => (
            item.path === '/logout' ? (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            )
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 