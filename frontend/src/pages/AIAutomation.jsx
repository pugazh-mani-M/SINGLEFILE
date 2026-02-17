import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import '../styles/ai-automation.css';
import '../styles/whatsapp-status.css';

const AIAutomation = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    autoResponseEnabled: true,
    businessHours: { enabled: true, start: '09:00', end: '18:00' },
    responseDelay: 30,
    freeMessageWindow: { trackingEnabled: true, autoTemplateAfter24h: true },
    metaCompliance: { optInRequired: true, templateOnlyAfter24h: true },
    smartFeatures: { intentRecognition: true, languageDetection: true, autoEscalation: true }
  });

  const [testMessage, setTestMessage] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: 'Message Received', url: 'https://yourapp.com/webhook/message', status: 'Active' },
    { id: 2, name: 'Message Status', url: 'https://yourapp.com/webhook/status', status: 'Active' }
  ]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '' });
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    appSecret: '',
    webhookToken: '',
    connectionStatus: 'Disconnected'
  });

  const saveSettings = async () => {
    try {
      setLoading(true);
      await axios.put('/api/ai/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testAIResponse = async () => {
    if (!testMessage.trim() || !testNumber.trim()) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/ai/test-response', {
        message: testMessage,
        phoneNumber: testNumber
      });
      setTestResponse(response.data.response);
      toast.success('AI response generated');
    } catch (error) {
      setTestResponse('Error generating response');
      toast.error('Failed to generate AI response');
    } finally {
      setLoading(false);
    }
  };

  const addWebhook = async () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/webhooks', newWebhook);
      setWebhooks(prev => [...prev, { ...response.data, status: 'Active' }]);
      setNewWebhook({ name: '', url: '' });
      toast.success('Webhook created successfully!');
    } catch (error) {
      toast.error('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id) => {
    try {
      await axios.delete(`/api/webhooks/${id}`);
      setWebhooks(prev => prev.filter(w => w.id !== id));
      toast.success('Webhook deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  const connectWhatsApp = async () => {
    try {
      setLoading(true);
      
      if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
        toast.warning('Please fill in Access Token and Phone Number ID');
        return;
      }
      
      const response = await axios.post('/api/whatsapp/connect', whatsappConfig);
      setWhatsappConfig(prev => ({ ...prev, connectionStatus: 'Connected' }));
      toast.success('WhatsApp connected successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Connection failed';
      toast.error('Failed to connect: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      setLoading(true);
      await axios.post('/api/whatsapp/disconnect');
      setWhatsappConfig(prev => ({ ...prev, connectionStatus: 'Disconnected' }));
      toast.success('WhatsApp disconnected successfully!');
    } catch (error) {
      toast.error('Failed to disconnect WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/whatsapp/test');
      toast.success('Connection test successful!');
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-automation-container">
      <div className="ai-header">
        <h1>AI Automation</h1>
        <p>Configure 24/7 automated responses for your WhatsApp CRM</p>
      </div>

      <div className="ai-section">
        <h3>Auto Response</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Enable AI Auto-Response</h4>
            <p>Automatically respond to customer messages using AI</p>
          </div>
          <button 
            className={`toggle-switch ${settings.autoResponseEnabled ? 'active' : ''}`}
            onClick={() => setSettings(prev => ({ ...prev, autoResponseEnabled: !prev.autoResponseEnabled }))}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
      </div>

      <div className="ai-section">
        <h3>Business Hours</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Outside Business Hours</h4>
            <p>Auto-respond when outside business hours</p>
          </div>
          <button 
            className={`toggle-switch ${settings.businessHours.enabled ? 'active' : ''}`}
            onClick={() => setSettings(prev => ({
              ...prev,
              businessHours: { ...prev.businessHours, enabled: !prev.businessHours.enabled }
            }))}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
        
        {settings.businessHours.enabled && (
          <div className="time-settings">
            <div className="time-input-group">
              <label>Business Hours</label>
              <div className="time-range">
                <div className="time-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <input 
                    type="time" 
                    value={settings.businessHours.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, start: e.target.value }
                    }))}
                  />
                </div>
                <span className="time-separator">to</span>
                <div className="time-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <input 
                    type="time" 
                    value={settings.businessHours.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ai-section">
        <h3>24-Hour Free Message Window</h3>
        <div className="feature-description">
          <p>WhatsApp allows free messages within 24 hours of customer's last message. After 24 hours, only approved templates can be sent.</p>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h4>Track 24-Hour Window</h4>
            <p>Monitor when customers can receive free-form messages</p>
          </div>
          <button 
            className={`toggle-switch ${settings.freeMessageWindow.trackingEnabled ? 'active' : ''}`}
            onClick={() => setSettings(prev => ({
              ...prev,
              freeMessageWindow: { ...prev.freeMessageWindow, trackingEnabled: !prev.freeMessageWindow.trackingEnabled }
            }))}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Auto-Switch to Templates</h4>
            <p>Automatically use approved templates after 24-hour window expires</p>
          </div>
          <button 
            className={`toggle-switch ${settings.freeMessageWindow.autoTemplateAfter24h ? 'active' : ''}`}
            onClick={() => setSettings(prev => ({
              ...prev,
              freeMessageWindow: { ...prev.freeMessageWindow, autoTemplateAfter24h: !prev.freeMessageWindow.autoTemplateAfter24h }
            }))}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
      </div>

      <div className="ai-section">
        <h3>24-Hour Window Status</h3>
        <div className="window-status-grid">
          <div className="status-card active">
            <div className="status-number">156</div>
            <div className="status-label">Active Windows</div>
            <div className="status-desc">Can send free messages</div>
          </div>
          <div className="status-card expired">
            <div className="status-number">23</div>
            <div className="status-label">Expired Windows</div>
            <div className="status-desc">Template-only messaging</div>
          </div>
          <div className="status-card pending">
            <div className="status-number">8</div>
            <div className="status-label">Expiring Soon</div>
            <div className="status-desc">Less than 2 hours remaining</div>
          </div>
        </div>
      </div>

      <div className="ai-section">
        <h3>WhatsApp Business Connection</h3>
        
        <div className={`ai-status ${whatsappConfig.connectionStatus === 'Connected' ? 'connected' : 'disconnected'}`}>
          <div className="status-dot"></div>
          <span>Status: {whatsappConfig.connectionStatus}</span>
          {whatsappConfig.connectionStatus === 'Connected' && (
            <span className="status-details"> - Ready to send/receive messages</span>
          )}
        </div>

        <div className="form-grid">
          <div>
            <label>Access Token</label>
            <input 
              type="password"
              placeholder="Enter WhatsApp Access Token"
              value={whatsappConfig.accessToken}
              onChange={(e) => setWhatsappConfig(prev => ({ ...prev, accessToken: e.target.value }))}
            />
          </div>
          <div>
            <label>Phone Number ID</label>
            <input 
              type="text"
              placeholder="Enter Phone Number ID"
              value={whatsappConfig.phoneNumberId}
              onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
            />
          </div>
          <div>
            <label>App Secret</label>
            <input 
              type="password"
              placeholder="Enter App Secret"
              value={whatsappConfig.appSecret}
              onChange={(e) => setWhatsappConfig(prev => ({ ...prev, appSecret: e.target.value }))}
            />
          </div>
          <div>
            <label>Webhook Token</label>
            <input 
              type="password"
              placeholder="Enter Webhook Verify Token"
              value={whatsappConfig.webhookToken}
              onChange={(e) => setWhatsappConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
            />
          </div>
        </div>

        <div className="ai-actions">
          {whatsappConfig.connectionStatus === 'Disconnected' ? (
            <button 
              className="btn btn-success"
              onClick={connectWhatsApp}
              disabled={loading || !whatsappConfig.accessToken || !whatsappConfig.phoneNumberId}
            >
              {loading ? 'Connecting...' : 'Connect WhatsApp'}
            </button>
          ) : (
            <button 
              className="btn btn-danger"
              onClick={disconnectWhatsApp}
              disabled={loading}
            >
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={testConnection}
            disabled={loading || whatsappConfig.connectionStatus === 'Disconnected'}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <div className="feature-description">
          <h4>Setup Instructions:</h4>
          <ol>
            <li>Create a Meta Developer Account and WhatsApp Business App</li>
            <li>Get your Access Token from the App Dashboard</li>
            <li>Copy the Phone Number ID from your WhatsApp Business Account</li>
            <li>Set up webhook URL: https://yourdomain.com/webhooks/whatsapp</li>
            <li>Subscribe to 'messages' webhook field</li>
          </ol>
        </div>
      </div>

      <div className="ai-section">
        <h3>Test AI Response</h3>
        <div className="test-area">
          <div className="test-input">
            <div>
              <label>Phone Number</label>
              <input 
                type="tel"
                placeholder="+1234567890"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
              />
            </div>
            <div>
              <label>Test Message</label>
              <input 
                type="text"
                placeholder="Enter a test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={testAIResponse}
              disabled={loading || !testMessage.trim() || !testNumber.trim()}
            >
              {loading ? 'Testing...' : 'Test AI Response'}
            </button>
          </div>
          
          {testResponse && (
            <div className="test-response">
              <label>AI Response</label>
              <div className="response-box">
                {testResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ai-actions">
        <button 
          className="btn btn-primary btn-lg"
          onClick={saveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AIAutomation;