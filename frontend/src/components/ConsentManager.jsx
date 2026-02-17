import React, { useState, useEffect } from 'react';
import '../styles/legal.css';

const ConsentManager = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consents, setConsents] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    whatsapp: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('userConsent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      setConsents(JSON.parse(savedConsent));
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsents = {
      necessary: true,
      analytics: true,
      marketing: true,
      whatsapp: true
    };
    setConsents(allConsents);
    localStorage.setItem('userConsent', JSON.stringify(allConsents));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const minimalConsents = {
      necessary: true,
      analytics: false,
      marketing: false,
      whatsapp: false
    };
    setConsents(minimalConsents);
    localStorage.setItem('userConsent', JSON.stringify(minimalConsents));
    setShowBanner(false);
  };

  const handleCustomSave = () => {
    localStorage.setItem('userConsent', JSON.stringify(consents));
    setShowBanner(false);
  };

  const handleConsentChange = (type) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    setConsents(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="consent-banner">
      <div className="consent-content">
        <h3>Cookie & Data Consent</h3>
        <p>We use cookies and process personal data to provide our WhatsApp CRM services. Please choose your preferences:</p>
        
        <div className="consent-options">
          <div className="consent-item">
            <label>
              <input
                type="checkbox"
                checked={consents.necessary}
                disabled
              />
              <span className="consent-label">Necessary (Required)</span>
              <p className="consent-desc">Essential for basic functionality</p>
            </label>
          </div>
          
          <div className="consent-item">
            <label>
              <input
                type="checkbox"
                checked={consents.analytics}
                onChange={() => handleConsentChange('analytics')}
              />
              <span className="consent-label">Analytics</span>
              <p className="consent-desc">Help us improve our service</p>
            </label>
          </div>
          
          <div className="consent-item">
            <label>
              <input
                type="checkbox"
                checked={consents.marketing}
                onChange={() => handleConsentChange('marketing')}
              />
              <span className="consent-label">Marketing</span>
              <p className="consent-desc">Personalized content and offers</p>
            </label>
          </div>
          
          <div className="consent-item">
            <label>
              <input
                type="checkbox"
                checked={consents.whatsapp}
                onChange={() => handleConsentChange('whatsapp')}
              />
              <span className="consent-label">WhatsApp Messaging</span>
              <p className="consent-desc">Send and receive WhatsApp messages</p>
            </label>
          </div>
        </div>
        
        <div className="consent-actions">
          <button onClick={handleRejectAll} className="btn-secondary">
            Reject All
          </button>
          <button onClick={handleCustomSave} className="btn-primary">
            Save Preferences
          </button>
          <button onClick={handleAcceptAll} className="btn-primary">
            Accept All
          </button>
        </div>
        
        <div className="consent-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;