import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { saveUserOffline } from '../services/database';

const LoginPage = ({ onLogin }) => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      
      // Save user data offline
      await saveUserOffline(response.user);
      
      // Call parent login handler
      onLogin(response.user, response.access_token);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ width: '400px', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>MediLink Health</h1>
          <p style={{ color: '#666' }}>Portable Patient Records System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={{ 
              color: '#e74c3c', 
              background: '#fdf2f2', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              t('signIn')
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h4 style={{ marginBottom: '8px', color: '#2c3e50' }}>Features:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>Offline access to patient records</li>
            <li>15-minute session timeout for security</li>
            <li>Complete audit trail</li>
            <li>QR code patient identification</li>
          </ul>
        </div>

        {!navigator.onLine && (
          <div className="offline-banner" style={{ marginTop: '16px', borderRadius: '4px' }}>
            You are currently offline. Some features may be limited.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;