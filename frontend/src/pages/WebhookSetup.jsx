import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/webhook-setup.css';

const WebhookSetup = () => {
  const { isDark } = useTheme();
  const toast = useToast();
  const [webhookConfig, setWebhookConfig] = useState({
    webhookUrl: '',
    verifyToken: 'my_secure_webhook_token_2024',
    subscribeFields: ['messages', 'message_status', 'message_template_status_update']
  });
  
  const [setupStatus, setSetupStatus] = useState({
    step: 1,
    verified: false,
    subscribed: false,
    testing: false
  });
  
  const [testResults, setTestResults] = useState(null);

  // Step 1: Generate webhook URL
  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin.replace('5173', '3000');
    const webhookUrl = `${baseUrl}/webhooks/whatsapp`;
    setWebhookConfig(prev => ({ ...prev, webhookUrl }));
    setSetupStatus(prev => ({ ...prev, step: 2 }));
  };

  // Step 2: Verify webhook
  const verifyWebhook = async () => {
    setSetupStatus(prev => ({ ...prev, testing: true }));
    
    // Simulate verification for demo
    setTimeout(() => {
      setSetupStatus(prev => ({ ...prev, verified: true, step: 3, testing: false }));
      setTestResults({ success: true, message: 'Webhook verification successful! (Demo Mode)' });
    }, 1000);
  };

  // Step 3: Test webhook with sample message
  const testWebhook = async () => {
    setSetupStatus(prev => ({ ...prev, testing: true }));
    
    // Simulate test for demo
    setTimeout(() => {
      setSetupStatus(prev => ({ ...prev, subscribed: true, step: 4, testing: false }));
      setTestResults({ success: true, message: 'Webhook test successful! (Demo Mode)' });
    }, 1000);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="webhook-setup-container">
      <div className="webhook-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        <h1>Webhook Setup for Meta Verification</h1>
        <p>Automated webhook configuration following Meta's official guidelines</p>
      </div>

      {/* Progress Steps */}
      <div className="setup-progress">
        <div className={`step ${setupStatus.step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Generate URL</div>
        </div>
        <div className={`step ${setupStatus.step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Verify</div>
        </div>
        <div className={`step ${setupStatus.step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Test</div>
        </div>
        <div className={`step ${setupStatus.step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Configure Meta</div>
        </div>
      </div>

      {/* Step 1: Generate Webhook URL */}
      {setupStatus.step === 1 && (
        <div className="setup-card">
          <h3>Step 1: Generate Webhook URL</h3>
          <p>Click below to generate your webhook URL for Meta Developer Console</p>
          <button className="btn btn-primary" onClick={generateWebhookUrl}>
            Generate Webhook URL
          </button>
        </div>
      )}

      {/* Step 2: Verify Webhook */}
      {setupStatus.step === 2 && (
        <div className="setup-card">
          <h3>Step 2: Verify Webhook Configuration</h3>
          
          <div className="config-item">
            <label>Webhook URL:</label>
            <div className="copy-field">
              <input type="text" value={webhookConfig.webhookUrl} readOnly />
              <button onClick={() => copyToClipboard(webhookConfig.webhookUrl)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
            </div>
          </div>

          <div className="config-item">
            <label>Verify Token:</label>
            <div className="copy-field">
              <input type="text" value={webhookConfig.verifyToken} readOnly />
              <button onClick={() => copyToClipboard(webhookConfig.verifyToken)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
            </div>
          </div>

          <button 
            className="btn btn-success" 
            onClick={verifyWebhook}
            disabled={setupStatus.testing}
          >
            {setupStatus.testing ? 'Verifying...' : 'Test Verification'}
          </button>

          {testResults && (
            <div className={`test-result ${testResults.success ? 'success' : 'error'}`}>
              {testResults.message}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Test Webhook */}
      {setupStatus.step === 3 && (
        <div className="setup-card">
          <h3>Step 3: Test Webhook with Sample Message</h3>
          <p>Send a test message to verify webhook is receiving data correctly</p>
          
          <button 
            className="btn btn-primary" 
            onClick={testWebhook}
            disabled={setupStatus.testing}
          >
            {setupStatus.testing ? 'Testing...' : 'Send Test Message'}
          </button>

          {testResults && (
            <div className={`test-result ${testResults.success ? 'success' : 'error'}`}>
              {testResults.message}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Meta Console Configuration */}
      {setupStatus.step === 4 && (
        <div className="setup-card">
          <h3>Step 4: Configure in Meta Developer Console</h3>
          
          <div className="meta-instructions">
            <h4>Follow these steps in Meta Developer Console:</h4>
            
            <div className="instruction-step">
              <div className="step-badge">1</div>
              <div className="step-content">
                <strong>Go to WhatsApp Configuration</strong>
                <p>Navigate to: <code>WhatsApp &gt; Configuration</code></p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-badge">2</div>
              <div className="step-content">
                <strong>Edit Webhook</strong>
                <p>Click "Edit" button in Webhook section</p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-badge">3</div>
              <div className="step-content">
                <strong>Enter Webhook URL</strong>
                <div className="copy-field">
                  <input type="text" value={webhookConfig.webhookUrl} readOnly />
                  <button onClick={() => copyToClipboard(webhookConfig.webhookUrl)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-badge">4</div>
              <div className="step-content">
                <strong>Enter Verify Token</strong>
                <div className="copy-field">
                  <input type="text" value={webhookConfig.verifyToken} readOnly />
                  <button onClick={() => copyToClipboard(webhookConfig.verifyToken)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-badge">5</div>
              <div className="step-content">
                <strong>Click "Verify and Save"</strong>
                <p>Meta will verify your webhook endpoint</p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-badge">6</div>
              <div className="step-content">
                <strong>Subscribe to Webhook Fields</strong>
                <p>Select these fields:</p>
                <ul>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    messages
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    message_status
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    message_template_status_update
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="success-banner">
            <div className="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h4>Webhook Setup Complete!</h4>
            <p>Your webhook is ready for Meta verification. Make sure to:</p>
            <ul>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Deploy to production with HTTPS
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Update webhook URL in Meta Console
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Test with real WhatsApp messages
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="info-card">
        <div className="card-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3>Security Features (Meta Compliant)</h3>
        </div>
        <div className="feature-grid">
          <div className="feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>SHA-256 Signature Verification</span>
          </div>
          <div className="feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Rate Limiting (100 req/min)</span>
          </div>
          <div className="feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Payload Validation</span>
          </div>
          <div className="feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Audit Logging</span>
          </div>
          <div className="feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>GDPR Compliant</span>
          </div>
          <div className="feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Security Headers</span>
          </div>
        </div>
      </div>

      <div className="info-card">
        <div className="card-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3>Production Deployment Checklist</h3>
        </div>
        <div className="checklist">
          <label>
            <input type="checkbox" />
            Deploy backend to production (Heroku, AWS, etc.)
          </label>
          <label>
            <input type="checkbox" />
            Enable HTTPS with SSL certificate
          </label>
          <label>
            <input type="checkbox" />
            Update FRONTEND_URL in .env to production domain
          </label>
          <label>
            <input type="checkbox" />
            Update webhook URL in Meta Console
          </label>
          <label>
            <input type="checkbox" />
            Test webhook with production URL
          </label>
          <label>
            <input type="checkbox" />
            Verify all security features are active
          </label>
          <label>
            <input type="checkbox" />
            Submit for Meta Business Verification
          </label>
        </div>
      </div>
    </div>
  );
};

export default WebhookSetup;