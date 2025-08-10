import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">MediLink Health</h1>
          <p className="hero-subtitle">{t('modernHealthcareManagement')}</p>
          <div className="hero-buttons">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/login')}
            >
              {t('getStarted')}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/about')}
            >
              {t('learnMore')}
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="medical-icon">⚕️</div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">{t('keyFeatures')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>{t('patientManagement')}</h3>
            <p>{t('comprehensivePatientRecords')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('analytics')}</h3>
            <p>{t('insightfulHealthAnalytics')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('security')}</h3>
            <p>{t('enterpriseGradeSecurity')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;