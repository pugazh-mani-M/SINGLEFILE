import React from 'react';
import '../styles/legal.css';

const TermsOfService = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using this WhatsApp CRM service, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section>
          <h2>2. Service Description</h2>
          <p>Our WhatsApp CRM provides:</p>
          <ul>
            <li>WhatsApp Business messaging management</li>
            <li>Customer relationship management tools</li>
            <li>Analytics and reporting features</li>
            <li>AI-powered automation</li>
          </ul>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Comply with WhatsApp Business policies</li>
            <li>Obtain proper consent before messaging customers</li>
            <li>Not use the service for spam or illegal activities</li>
            <li>Maintain the security of your account</li>
          </ul>
        </section>

        <section>
          <h2>4. WhatsApp Compliance</h2>
          <p>You must comply with:</p>
          <ul>
            <li>WhatsApp Business Platform policies</li>
            <li>Meta Commerce policies</li>
            <li>Applicable messaging regulations</li>
            <li>Opt-in requirements for marketing messages</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Processing</h2>
          <p>By using our service, you consent to the processing of your data as described in our Privacy Policy.</p>
        </section>

        <section>
          <h2>6. Service Availability</h2>
          <p>We strive to maintain service availability but do not guarantee uninterrupted access. We may suspend service for maintenance or updates.</p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages.</p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>We may terminate or suspend your account for violation of these terms or applicable laws.</p>
        </section>

        <section>
          <h2>9. Contact Information</h2>
          <p>For questions about these terms, contact us at:</p>
          <p>Email: legal@yourcompany.com<br/>
          Address: Your Business Address</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;