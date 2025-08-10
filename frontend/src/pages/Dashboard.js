import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auditAPI } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [auditSummary, setAuditSummary] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadAuditSummary();
  }, []);

  const loadAuditSummary = async () => {
    try {
      if (navigator.onLine) {
        const summary = await auditAPI.getSummary();
        setAuditSummary(summary);
      }
    } catch (error) {
      console.error('Failed to load audit summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">MediLink Health</div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/search" className="nav-link">Patient Search</Link>
            <Link to="/audit" className="nav-link">Audit Trail</Link>
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h1>Welcome, Dr. {user.first_name} {user.last_name}</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            {user.roles?.join(', ')} • {user.hospital_id ? `Hospital ID: ${user.hospital_id}` : 'System User'}
          </p>

          {/* Quick Actions */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px',
            marginBottom: '32px'
          }}>
            <Link to="/search" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}>
                <h3>🔍 Search Patients</h3>
                <p>Find patients by ID, name, phone, or national ID</p>
              </div>
            </Link>

            <Link to="/qr-scanner" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #27ae60, #229954)',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}>
                <h3>📱 QR Scanner</h3>
                <p>Scan patient QR codes for quick access</p>
              </div>
            </Link>

            <Link to="/audit" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #e67e22, #d35400)',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <h3>📋 Audit Trail</h3>
                <p>View system activity and patient access logs</p>
              </div>
            </Link>
          </div>

          {/* System Status */}
          <div className="card">
            <h3>System Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div className="detail-label">Connection Status</div>
                <div className="detail-value" style={{ 
                  color: navigator.onLine ? '#27ae60' : '#e74c3c' 
                }}>
                  {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
              <div>
                <div className="detail-label">Session Expires</div>
                <div className="detail-value">15 minutes from login</div>
              </div>
              <div>
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          {auditSummary && (
            <div className="card">
              <h3>Today's Activity</h3>
              {loading ? (
                <div className="loading">
                  <span className="spinner"></span>
                  Loading activity summary...
                </div>
              ) : (
                <div>
                  {auditSummary.today_activity?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                      {auditSummary.today_activity.map((activity, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                            {activity.count}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {activity.action_type.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#666', textAlign: 'center' }}>No activity recorded today</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recent Users */}
          {auditSummary?.most_active_users?.length > 0 && (
            <div className="card">
              <h3>Most Active Users (This Week)</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Username</th>
                      <th>Activity Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditSummary.most_active_users.slice(0, 5).map((user, index) => (
                      <tr key={index}>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.username}</td>
                        <td>{user.activity_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Offline Notice */}
          {!navigator.onLine && (
            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4 style={{ color: '#856404', marginBottom: '8px' }}>⚠️ Working Offline</h4>
              <p style={{ color: '#856404', margin: 0 }}>
                You are currently offline. Patient data will be cached locally and synced when connection is restored.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;