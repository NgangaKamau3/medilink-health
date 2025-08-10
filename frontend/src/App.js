import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PatientSearch from './pages/PatientSearch';
import PatientDashboard from './pages/PatientDashboard';
import EditRecord from './pages/EditRecord';
import AuditTrail from './pages/AuditTrail';
import QRScannerPage from './pages/QRScanner';
import Navbar from './components/Navbar';

import './i18n';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleSyncComplete = (event) => {
      setSyncStatus(event.detail.success ? 'completed' : 'failed');
      setTimeout(() => setSyncStatus('idle'), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('syncComplete', handleSyncComplete);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncComplete', handleSyncComplete);
    };
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <Router>
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-item">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          {syncStatus !== 'idle' && (
            <div className="status-item">
              <span className={`sync-status ${syncStatus}`}>
                {syncStatus === 'completed' ? '✓ Synced' : '⚠ Sync Failed'}
              </span>
            </div>
          )}
        </div>

        <Routes>
          <Route 
            path="/" 
            element={
              !isAuthenticated ? 
              <LandingPage /> : 
              <Navigate to="/dashboard" />
            } 
          />
          
          <Route 
            path="/about" 
            element={<AboutPage />} 
          />
          
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <LoginPage onLogin={handleLogin} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/search" 
            element={
              isAuthenticated ? 
              <PatientSearch user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/patient/:patientId" 
            element={
              isAuthenticated ? 
              <PatientDashboard user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/patient/:patientId/edit" 
            element={
              isAuthenticated ? 
              <EditRecord user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/audit" 
            element={
              isAuthenticated ? 
              <AuditTrail user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/qr-scanner" 
            element={
              isAuthenticated ? 
              <QRScannerPage /> : 
              <Navigate to="/login" />
            } 
          />
          

        </Routes>
      </Router>
    </div>
  );
}

export default App;