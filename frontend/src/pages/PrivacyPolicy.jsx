import React from 'react';
import '../styles/legal.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li>Account information (name, email, phone number)</li>
            <li>WhatsApp messages and conversation data</li>
            <li>Usage data and analytics</li>
            <li>Device and browser information</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our CRM services</li>
            <li>Process WhatsApp messages and conversations</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information. We may share your information only:</p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and safety</li>
          </ul>
        </section>

        <section>
          <h2>4. Your Rights (GDPR)</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Erase your data ("right to be forgotten")</li>
            <li>Restrict processing</li>
            <li>Data portability</li>
            <li>Object to processing</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>We retain your personal information only as long as necessary to provide our services and comply with legal obligations.</p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>For privacy-related questions or to exercise your rights, contact us at:</p>
          <p>Email: privacy@yourcompany.com<br/>
          Address: Your Business Address</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;