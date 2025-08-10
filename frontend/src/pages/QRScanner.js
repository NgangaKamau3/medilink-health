import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QrScanner from 'react-qr-scanner';

const QRScannerPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');

  const handleScan = (data) => {
    if (data) {
      try {
        // Extract patient ID from QR code data
        const patientId = data.text || data;
        if (patientId && patientId.match(/^\d+$/)) {
          navigate(`/patient/${patientId}`);
        } else {
          setError('Invalid QR code format');
        }
      } catch (err) {
        setError('Failed to process QR code');
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Camera access denied or not available');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2>{t('qrScanner')}</h2>
        
        {scanning ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <QrScanner
                delay={300}
                style={{ width: '100%', maxWidth: '400px' }}
                onError={handleError}
                onScan={handleScan}
              />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p>{t('scanPatientQR')}</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setScanning(false)}
              >
                {t('stopScanning')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p>{t('scannerStopped')}</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setScanning(true);
                setError('');
              }}
            >
              {t('startScanning')}
            </button>
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#fee', 
            border: '1px solid #fcc', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '20px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;