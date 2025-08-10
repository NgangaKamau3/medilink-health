import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <div className="about-hero">
        <h1 className="about-title">{t('aboutMediLink')}</h1>
        <p className="about-subtitle">{t('transformingHealthcare')}</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>{t('ourMission')}</h2>
          <p>{t('missionDescription')}</p>
        </section>

        <section className="about-section">
          <h2>{t('whyChooseUs')}</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🚀</span>
              <h3>{t('efficiency')}</h3>
              <p>{t('efficiencyDescription')}</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔐</span>
              <h3>{t('reliability')}</h3>
              <p>{t('reliabilityDescription')}</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💡</span>
              <h3>{t('innovation')}</h3>
              <p>{t('innovationDescription')}</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>{t('readyToStart')}</h2>
          <p>{t('joinThousands')}</p>
          <button 
            className="cta-button"
            onClick={() => navigate('/login')}
          >
            {t('getStarted')}
          </button>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;