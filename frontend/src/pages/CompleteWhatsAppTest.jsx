import React, { useState } from 'react';
import axios from 'axios';

const CompleteWhatsAppTest = () => {
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: ''
  });
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const addResult = (type, status, data) => {
    setResults(prev => [{
      id: Date.now(),
      type,
      status,
      data,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/test/save-config', config);
      addResult('Config', 'Saved', response.data);
      setCurrentStep(2);
    } catch (error) {
      addResult('Config', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/test/test-connection');
      addResult('Connection', response.data.success ? 'Success' : 'Failed', response.data);
      if (response.data.success) setCurrentStep(3);
    } catch (error) {
      addResult('Connection', 'Error', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const sendTestMessage = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/test/send-test', {
        phoneNumber: testPhone,
        message: testMessage
      });
      addResult('Message', 'Sent', response.data);
      setCurrentStep(4);
    } catch (error) {
      addResult('Message', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const sendTemplate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/test/send-template', {
        phoneNumber: testPhone,
        templateName: 'hello_world',
        languageCode: 'en_US'
      });
      addResult('Template', 'Sent', response.data);
    } catch (error) {
      addResult('Template', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#25d366', 
        fontSize: '2.5rem',
        marginBottom: '10px'
      }}>
        🚀 Complete WhatsApp Business API Tester
      </h1>
      
      <p style={{ 
        textAlign: 'center', 
        color: '#666', 
        fontSize: '1.1rem',
        marginBottom: '30px'
      }}>
        Test your WhatsApp Business API integration step by step
      </p>

      {/* Progress Steps */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { step: 1, title: 'Configure API', icon: '⚙️' },
          { step: 2, title: 'Test Connection', icon: '🔗' },
          { step: 3, title: 'Send Message', icon: '📤' },
          { step: 4, title: 'Success!', icon: '🎉' }
        ].map(({ step, title, icon }) => (
          <div key={step} style={{
            padding: '15px 20px',
            borderRadius: '10px',
            backgroundColor: currentStep >= step ? '#25d366' : '#e0e0e0',
            color: currentStep >= step ? 'white' : '#666',
            fontWeight: 'bold',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
            <div>{title}</div>
          </div>
        ))}
      </div>

      {/* Setup Guide */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>📋 Quick Setup Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          <div>
            <h4 style={{ color: '#495057' }}>1. Create WhatsApp App</h4>
            <p>• Go to <a href="https://developers.facebook.com/apps" target="_blank">developers.facebook.com</a></p>
            <p>• Create App → Business → Add WhatsApp</p>
          </div>
          <div>
            <h4 style={{ color: '#495057' }}>2. Get Credentials</h4>
            <p>• Copy Access Token (starts with EAA...)</p>
            <p>• Copy Phone Number ID (15 digits)</p>
          </div>
          <div>
            <h4 style={{ color: '#495057' }}>3. Add Test Phone</h4>
            <p>• In Meta console, add your phone number</p>
            <p>• Format: +1234567890 (with country code)</p>
          </div>
        </div>
      </div>

      {/* Step 1: API Configuration */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>⚙️ Step 1: Configure WhatsApp API</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Access Token:
            </label>
            <input
              type="text"
              value={config.accessToken}
              onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
              placeholder="EAAxxxxxxxxx..."
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #ddd', 
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Phone Number ID:
            </label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
              placeholder="123456789012345"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #ddd', 
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        <button
          onClick={saveConfig}
          disabled={loading || !config.accessToken || !config.phoneNumberId}
          style={{
            padding: '15px 30px',
            backgroundColor: '#25d366',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            opacity: (loading || !config.accessToken || !config.phoneNumberId) ? 0.5 : 1
          }}
        >
          💾 Save Configuration
        </button>
      </div>

      {/* Step 2: Test Connection */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>🔗 Step 2: Test API Connection</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Verify that your WhatsApp Business API credentials are working correctly.
        </p>
        
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          🔗 Test Connection
        </button>
      </div>

      {/* Step 3: Send Messages */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>📤 Step 3: Send Test Messages</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Your Phone Number (with country code):
          </label>
          <input
            type="tel"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="+1234567890"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '2px solid #ddd', 
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '15px'
            }}
          />
          
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Test Message:
          </label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Hello! This is a test message from WhatsApp CRM."
            rows={3}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '2px solid #ddd', 
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={sendTestMessage}
            disabled={loading || !testPhone || !testMessage}
            style={{
              padding: '15px 25px',
              backgroundColor: '#25d366',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              opacity: (loading || !testPhone || !testMessage) ? 0.5 : 1
            }}
          >
            📤 Send Text Message
          </button>
          
          <button
            onClick={sendTemplate}
            disabled={loading || !testPhone}
            style={{
              padding: '15px 25px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              opacity: (loading || !testPhone) ? 0.5 : 1
            }}
          >
            📋 Send Template
          </button>
        </div>
      </div>

      {/* Quick Test Messages */}
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        border: '2px solid #25d366'
      }}>
        <h3 style={{ color: '#155724', marginTop: 0 }}>⚡ Quick Test Messages</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          {[
            "Hello! Testing WhatsApp API integration 🚀",
            "Your WhatsApp CRM is working perfectly! ✅",
            "This message was sent via WhatsApp Business API 📱",
            "Testing complete - everything is working! 🎉"
          ].map((msg, index) => (
            <button
              key={index}
              onClick={() => setTestMessage(msg)}
              style={{
                padding: '10px',
                backgroundColor: 'white',
                border: '1px solid #25d366',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>📊 Test Results</h3>
        
        {results.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            📋 No tests run yet. Start by configuring your API credentials above.
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.map(result => (
              <div key={result.id} style={{
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                backgroundColor: result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' 
                  ? '#d4edda' : '#f8d7da',
                border: `2px solid ${result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '#28a745' : '#dc3545'}`
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '#155724' : '#721c24'
                }}>
                  {result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '✅' : '❌'} 
                  {result.type} - {result.status} ({result.time})
                </div>
                <pre style={{
                  fontSize: '12px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteWhatsAppTest;