import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <span className="brand-icon">⚕️</span>
        <span className="brand-text">MediLink Health</span>
      </div>
      
      <div className="navbar-menu">
        {!isAuthenticated ? (
          <div className="navbar-items">
            <button 
              className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              {t('home')}
            </button>
            <button 
              className={`nav-btn ${location.pathname === '/about' ? 'active' : ''}`}
              onClick={() => navigate('/about')}
            >
              {t('about')}
            </button>
            <button 
              className={`nav-btn ${location.pathname === '/login' ? 'active' : ''}`}
              onClick={() => navigate('/login')}
            >
              {t('login')}
            </button>
          </div>
        ) : (
          <div className="navbar-items">
            <button 
              className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              {t('dashboard')}
            </button>
            <button 
              className={`nav-btn ${location.pathname === '/search' ? 'active' : ''}`}
              onClick={() => navigate('/search')}
            >
              {t('patientSearch')}
            </button>
            <button 
              className={`nav-btn ${location.pathname === '/audit' ? 'active' : ''}`}
              onClick={() => navigate('/audit')}
            >
              {t('auditTrail')}
            </button>
            <div className="user-menu">
              <span className="user-name">Dr. {user?.first_name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;