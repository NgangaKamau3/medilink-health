import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { patientsAPI } from '../services/api';

const PatientSearch = ({ user }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await patientsAPI.search({
        query: searchQuery.trim(),
        search_type: searchType
      });
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">MediLink Health</div>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>
            <Link to="/search" className="nav-link active">{t('patientSearch')}</Link>
            <Link to="/audit" className="nav-link">{t('auditTrail')}</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h1>{t('patientSearch')}</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Search for patients using various criteria. Works offline with cached data.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch}>
            <div className="search-container">
              <div className="form-group" style={{ flex: 1 }}>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Enter search term..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <select
                  className="form-control search-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="name">{t('patientName')}</option>
                  <option value="id">{t('patientId')}</option>
                  <option value="phone">{t('phoneNumber')}</option>
                  <option value="national_id">{t('nationalId')}</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  `🔍 ${t('search')}`
                )}
              </button>
            </div>
          </form>

          {/* Search Instructions */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '4px', 
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            <h4 style={{ marginBottom: '8px', color: '#2c3e50' }}>Search Tips:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li><strong>Name:</strong> Search by first or last name (partial matches work)</li>
              <li><strong>Patient ID:</strong> Enter exact patient ID number</li>
              <li><strong>Phone:</strong> Enter full or partial phone number</li>
              <li><strong>National ID:</strong> Enter exact national ID number</li>
            </ul>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="card">
              <h3>Search Results ({searchResults.length})</h3>
              
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No patients found matching your search criteria.</p>
                  <p>Try adjusting your search terms or search type.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t('patientId')}</th>
                        <th>{t('name')}</th>
                        <th>{t('age')}</th>
                        <th>{t('gender')}</th>
                        <th>{t('phone')}</th>
                        <th>{t('nationalId')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((patient) => (
                        <tr key={patient.patient_id}>
                          <td>
                            <strong>{patient.patient_id}</strong>
                          </td>
                          <td>
                            <div>
                              <strong>{patient.first_name} {patient.last_name}</strong>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                DOB: {formatDate(patient.date_of_birth)}
                              </div>
                            </div>
                          </td>
                          <td>{calculateAge(patient.date_of_birth)} years</td>
                          <td>{patient.gender || 'N/A'}</td>
                          <td>{patient.phone_number}</td>
                          <td>{patient.national_id_number || 'N/A'}</td>
                          <td>
                            <Link 
                              to={`/patient/${patient.patient_id}`}
                              className="btn btn-primary"
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              {t('viewRecord')}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QR Code Scanner Section */}
          <div className="card">
            <h3>QR Code Scanner</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Scan a patient's QR code for quick access to their records.
            </p>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => alert('QR Scanner would open here')}
              >
                📱 Open QR Scanner
              </button>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Camera permission required
              </p>
            </div>
          </div>

          {/* Offline Status */}
          {!navigator.onLine && (
            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4 style={{ color: '#856404', marginBottom: '8px' }}>⚠️ Offline Mode</h4>
              <p style={{ color: '#856404', margin: 0 }}>
                Searching cached patient data. Results may be limited to previously accessed records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSearch;