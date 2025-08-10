import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auditAPI } from '../services/api';

const AuditTrail = ({ user }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    patient_id: searchParams.get('patient_id') || '',
    user_id: '',
    action_type: '',
    start_date: '',
    end_date: ''
  });

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await auditAPI.getLogs(filters);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAuditLogs();
  };

  const clearFilters = () => {
    setFilters({
      patient_id: '',
      user_id: '',
      action_type: '',
      start_date: '',
      end_date: ''
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN': '#27ae60',
      'LOGOUT': '#95a5a6',
      'VIEW': '#3498db',
      'UPDATE': '#f39c12',
      'CREATE': '#27ae60',
      'DELETE': '#e74c3c',
      'SEARCH': '#9b59b6'
    };
    return colors[action] || '#666';
  };

  const formatJsonValue = (jsonString) => {
    if (!jsonString) return 'N/A';
    try {
      const obj = JSON.parse(jsonString);
      return Object.entries(obj).map(([key, value]) => 
        `${key}: ${value}`
      ).join(', ');
    } catch {
      return jsonString;
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">MediLink Health</div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>
            <Link to="/search" className="nav-link">{t('patientSearch')}</Link>
            <Link to="/audit" className="nav-link active">{t('auditTrail')}</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h1>{t('auditTrail')}</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Complete system activity log with user actions and data changes.
          </p>

          {/* Filters */}
          <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div className="form-group">
                <label htmlFor="patient_id">{t('patientId')}</label>
                <input
                  type="number"
                  id="patient_id"
                  name="patient_id"
                  className="form-control"
                  value={filters.patient_id}
                  onChange={handleFilterChange}
                  placeholder="Enter patient ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="user_id">{t('userId')}</label>
                <input
                  type="number"
                  id="user_id"
                  name="user_id"
                  className="form-control"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                  placeholder="Enter user ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="action_type">Action Type</label>
                <select
                  id="action_type"
                  name="action_type"
                  className="form-control"
                  value={filters.action_type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="VIEW">View</option>
                  <option value="UPDATE">Update</option>
                  <option value="CREATE">Create</option>
                  <option value="DELETE">Delete</option>
                  <option value="SEARCH">Search</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="form-control"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="form-control"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  '🔍 Search Logs'
                )}
              </button>
              <button 
                type="button" 
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </form>

          {/* Results */}
          <div className="card">
            <h3>Audit Log Results ({auditLogs.length})</h3>
            
            {loading ? (
              <div className="loading">
                <span className="spinner"></span>
                Loading audit logs...
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No audit logs found matching your criteria.</p>
                <p>Try adjusting your filters or date range.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {auditLogs.map((log) => (
                  <div key={log.log_id} className="audit-item">
                    <div className="audit-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span 
                          className="audit-action"
                          style={{ color: getActionColor(log.action_type) }}
                        >
                          {log.action_type}
                        </span>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                          by {log.first_name} {log.last_name} ({log.username})
                        </span>
                        {log.record_id_affected && (
                          <span style={{ fontSize: '12px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
                            Record ID: {log.record_id_affected}
                          </span>
                        )}
                      </div>
                      <div className="audit-timestamp">
                        {formatDateTime(log.action_timestamp)}
                      </div>
                    </div>
                    
                    <div className="audit-details">
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Module:</strong> {log.module}
                        {log.table_name && <span> • <strong>Table:</strong> {log.table_name}</span>}
                        {log.ip_address && <span> • <strong>IP:</strong> {log.ip_address}</span>}
                      </div>
                      
                      {log.old_value && (
                        <div style={{ marginBottom: '4px', fontSize: '13px' }}>
                          <strong>Previous Values:</strong> {formatJsonValue(log.old_value)}
                        </div>
                      )}
                      
                      {log.new_value && (
                        <div style={{ fontSize: '13px' }}>
                          <strong>New Values:</strong> {formatJsonValue(log.new_value)}
                        </div>
                      )}
                      
                      {log.error_message && (
                        <div style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          background: '#fdf2f2', 
                          color: '#e74c3c',
                          borderRadius: '3px',
                          fontSize: '13px'
                        }}>
                          <strong>Error:</strong> {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="card">
            <h4>Export Options</h4>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Export audit logs for compliance and reporting purposes.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => alert('CSV export would be implemented here')}
              >
                📊 Export to CSV
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => alert('PDF export would be implemented here')}
              >
                📄 Export to PDF
              </button>
            </div>
          </div>

          {/* Offline Notice */}
          {!navigator.onLine && (
            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4 style={{ color: '#856404', marginBottom: '8px' }}>⚠️ Offline Mode</h4>
              <p style={{ color: '#856404', margin: 0 }}>
                Audit logs require an active internet connection. Please connect to view complete audit trail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;