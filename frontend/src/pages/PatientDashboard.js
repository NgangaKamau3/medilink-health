import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { patientsAPI } from '../services/api';
import QRCode from 'qrcode';

const PatientDashboard = () => {
  const { patientId } = useParams();
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  const loadPatientData = useCallback(async () => {
    try {
      setError(null);
      const [patientData, encountersData] = await Promise.all([
        patientsAPI.getById(parseInt(patientId)),
        patientsAPI.getEncounters(parseInt(patientId))
      ]);
      
      setPatient(patientData);
      setEncounters(encountersData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load patient data:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);
      
      // Generate QR code
      const qrData = JSON.stringify({
        patient_id: patientData.patient_id,
        name: `${patientData.first_name} ${patientData.last_name}`,
        dob: patientData.date_of_birth
      });
      
      const qrUrl = await QRCode.toDataURL(qrData);
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      console.error('Failed to load patient data:', error);
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner"></span>
        Loading patient data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Error Loading Patient Data</h2>
          <p>{error}</p>
          <button onClick={loadPatientData} className="btn btn-primary">Try Again</button>
          <Link to="/search" className="btn btn-secondary" style={{marginLeft: '10px'}}>Back to Search</Link>
        </div>
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
            <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>
            <Link to="/search" className="nav-link">{t('patientSearch')}</Link>
            <Link to="/audit" className="nav-link">{t('auditTrail')}</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Patient Header */}
        <div className="card patient-card">
          <div className="patient-header">
            <div>
              <div className="patient-name">
                {patient.first_name} {patient.last_name}
              </div>
              <div className="patient-id">
                Patient ID: {patient.patient_id} • 
                Age: {calculateAge(patient.date_of_birth)} years • 
                {patient.gender || 'Gender not specified'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowQR(!showQR)}
                className="btn btn-secondary"
              >
                {showQR ? t('hideQR') : t('showQR')}
              </button>
              <Link 
                to={`/patient/${patientId}/edit`}
                className="btn btn-primary"
              >
                {t('editRecord')}
              </Link>
            </div>
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="qr-container">
              <h4>{t('patientQRCode')}</h4>
              <img src={qrCodeUrl} alt="Patient QR Code" className="qr-code" />
              <p style={{ fontSize: '12px', color: '#666' }}>
                Scan this code for quick patient identification
              </p>
            </div>
          )}

          {/* Patient Details */}
          <div className="patient-details">
            <div className="detail-item">
              <div className="detail-label">Date of Birth</div>
              <div className="detail-value">{formatDate(patient.date_of_birth)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Phone Number</div>
              <div className="detail-value">{patient.phone_number}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{patient.email || 'Not provided'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">National ID</div>
              <div className="detail-value">{patient.national_id_number || 'Not provided'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Address</div>
              <div className="detail-value">
                {patient.address ? 
                  `${patient.address}, ${patient.city || ''}`.trim().replace(/,$/, '') : 
                  'Not provided'
                }
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Emergency Contact</div>
              <div className="detail-value">
                {patient.emergency_contact_name ? 
                  `${patient.emergency_contact_name} - ${patient.emergency_contact_phone}` : 
                  'Not provided'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Medical Encounters */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Medical Encounters ({encounters.length})</h3>
            <button 
              className="btn btn-primary"
              onClick={() => alert('Add new encounter form would open here')}
            >
              + New Encounter
            </button>
          </div>

          {encounters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No medical encounters recorded for this patient.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Chief Complaint</th>
                    <th>Diagnosis</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {encounters.map((encounter) => (
                    <tr key={encounter.encounter_id}>
                      <td>{formatDateTime(encounter.encounter_date_time)}</td>
                      <td>
                        {encounter.doctor_first_name && encounter.doctor_last_name ? 
                          `Dr. ${encounter.doctor_first_name} ${encounter.doctor_last_name}` : 
                          `Doctor ID: ${encounter.doctor_id}`
                        }
                      </td>
                      <td>{encounter.chief_complaint || 'Not specified'}</td>
                      <td>{encounter.diagnosis_description || 'Not specified'}</td>
                      <td>
                        <button 
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                          onClick={() => alert('Encounter details would open here')}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginnBottom: '20px'
        }}>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <h4>📋 Lab Results</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>View laboratory test results</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <h4>🏥 Admissions</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>View admission history</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <h4>💊 Medications</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>Current and past medications</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <h4>📸 Imaging</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>X-rays, CT scans, MRI results</p>
          </div>
        </div>

        {/* Patient History Link */}
        <div className="card">
          <h4>Audit Trail</h4>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            View complete edit history and access logs for this patient.
          </p>
          <Link 
            to={`/audit?patient_id=${patientId}`}
            className="btn btn-secondary"
          >
            View Patient History
          </Link>
        </div>

        {/* Offline Notice */}
        {!navigator.onLine && (
          <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <h4 style={{ color: '#856404', marginBottom: '8px' }}>⚠️ Offline Mode</h4>
            <p style={{ color: '#856404', margin: 0 }}>
              Viewing cached patient data. Changes will be synced when connection is restored.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;