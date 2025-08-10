import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientsAPI } from '../services/api';

const EditRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadPatient = useCallback(async () => {
    try {
      const patientData = await patientsAPI.getById(parseInt(patientId));
      setPatient(patientData);
      setFormData({
        first_name: patientData.first_name || '',
        last_name: patientData.last_name || '',
        phone_number: patientData.phone_number || '',
        email: patientData.email || '',
        address: patientData.address || '',
        city: patientData.city || '',
        emergency_contact_name: patientData.emergency_contact_name || '',
        emergency_contact_phone: patientData.emergency_contact_phone || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load patient:', error);
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Only send changed fields
      const changedFields = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== (patient[key] || '')) {
          changedFields[key] = formData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setMessage('No changes detected');
        setSaving(false);
        return;
      }

      await patientsAPI.update(parseInt(patientId), changedFields);
      
      setMessage(navigator.onLine ? 
        'Patient record updated successfully' : 
        'Changes saved offline and will sync when online'
      );
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate(`/patient/${patientId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to update patient:', error);
      setMessage('Failed to update patient record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner"></span>
        Loading patient data...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container">
        <div className="card">
          <h2>Patient Not Found</h2>
          <p>The requested patient could not be found.</p>
          <Link to="/search" className="btn btn-primary">Back to Search</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">MediLink Health</div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/search" className="nav-link">Patient Search</Link>
            <Link to={`/patient/${patientId}`} className="nav-link">Patient Record</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1>Edit Patient Record</h1>
              <p style={{ color: '#666', margin: 0 }}>
                Patient ID: {patient.patient_id} • {patient.first_name} {patient.last_name}
              </p>
            </div>
            <Link 
              to={`/patient/${patientId}`}
              className="btn btn-secondary"
            >
              Cancel
            </Link>
          </div>

          {/* Warning about audit trail */}
          <div style={{ 
            background: '#e3f2fd', 
            border: '1px solid #bbdefb', 
            padding: '16px', 
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h4 style={{ color: '#1976d2', marginBottom: '8px' }}>📋 Audit Trail Notice</h4>
            <p style={{ color: '#1976d2', margin: 0, fontSize: '14px' }}>
              All changes to patient records are automatically logged with your user ID, timestamp, 
              and the specific fields modified. This ensures complete traceability of all medical record updates.
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              background: message.includes('Failed') ? '#fdf2f2' : '#f0f9ff',
              color: message.includes('Failed') ? '#e74c3c' : '#0369a1',
              border: `1px solid ${message.includes('Failed') ? '#fecaca' : '#bae6fd'}`
            }}>
              {message}
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Personal Information */}
              <div>
                <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="first_name">First Name *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    className="form-control"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address & Emergency Contact */}
              <div>
                <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>Address & Emergency Contact</h3>
                
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
                  <input
                    type="text"
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    className="form-control"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    className="form-control"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Read-only fields display */}
            <div style={{ marginTop: '32px', padding: '16px', background: '#f8f9fa', borderRadius: '4px' }}>
              <h4 style={{ marginBottom: '12px', color: '#666' }}>Read-Only Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Patient ID:</strong> {patient.patient_id}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}
                </div>
                <div>
                  <strong>Gender:</strong> {patient.gender || 'Not specified'}
                </div>
                <div>
                  <strong>National ID:</strong> {patient.national_id_number || 'Not provided'}
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', margin: 0 }}>
                These fields cannot be modified through this form. Contact system administrator for changes.
              </p>
            </div>

            {/* Form Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid #eee'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                * Required fields
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link 
                  to={`/patient/${patientId}`}
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner"></span>
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Offline Notice */}
          {!navigator.onLine && (
            <div className="card" style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#856404', marginBottom: '8px' }}>⚠️ Offline Mode</h4>
              <p style={{ color: '#856404', margin: 0 }}>
                Changes will be saved locally and synchronized when connection is restored.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditRecord;