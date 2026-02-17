import React, { useState } from 'react';
import axios from 'axios';

const MessageTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [templateName, setTemplateName] = useState('hello_world');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [apiConfig, setApiConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: ''
  });
  const [showConfig, setShowConfig] = useState(false);

  // Save API configuration
  const saveApiConfig = async () => {
    try {
      await axios.post('/api/test/save-config', apiConfig);
      addResult('API Config', 'Saved', 'Configuration saved successfully');
      setShowConfig(false);
    } catch (error) {
      addResult('API Config', 'Failed', error.response?.data || error.message);
    }
  };

  // Test WhatsApp connection
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/test/test-connection');
      setConnectionStatus(response.data);
      addResult('Connection Test', response.data.success ? 'Success' : 'Failed', response.data);
    } catch (error) {
      setConnectionStatus({ success: false, error: error.message });
      addResult('Connection Test', 'Error', error.response?.data || error.message);
    }
    setLoading(false);
  };

  // Send text message
  const sendTextMessage = async (e) => {
    e.preventDefault();
    if (!phoneNumber || !message) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/test/send-test', {
        phoneNumber,
        message
      });
      addResult('Text Message', 'Sent', response.data);
      setMessage('');
    } catch (error) {
      addResult('Text Message', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  // Send template message
  const sendTemplate = async () => {
    if (!phoneNumber || !templateName) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/test/send-template', {
        phoneNumber,
        templateName,
        languageCode: 'en'
      });
      addResult('Template Message', 'Sent', response.data);
    } catch (error) {
      addResult('Template Message', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const addResult = (type, status, data) => {
    const result = {
      id: Date.now(),
      type,
      status,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [result, ...prev]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>WhatsApp CRM - Live Testing</h2>
      
      {/* API Configuration */}
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>WhatsApp API Configuration</h3>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showConfig ? 'Hide' : 'Configure'}
          </button>
        </div>
        
        {showConfig && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Access Token:
              </label>
              <input
                type="text"
                value={apiConfig.accessToken}
                onChange={(e) => setApiConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                placeholder="Your WhatsApp Access Token"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Phone Number ID:
              </label>
              <input
                type="text"
                value={apiConfig.phoneNumberId}
                onChange={(e) => setApiConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                placeholder="Your Phone Number ID"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Business Account ID:
              </label>
              <input
                type="text"
                value={apiConfig.businessAccountId}
                onChange={(e) => setApiConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                placeholder="Your Business Account ID"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <button
              onClick={saveApiConfig}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save Configuration
            </button>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        backgroundColor: connectionStatus?.success ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connectionStatus?.success ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <button onClick={testConnection} disabled={loading} style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          Test Connection
        </button>
        {connectionStatus && (
          <span style={{ color: connectionStatus.success ? '#155724' : '#721c24' }}>
            {connectionStatus.success ? '✅ Connected' : '❌ Connection Failed'}
          </span>
        )}
      </div>

      {/* Phone Number Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Test Phone Number (with country code):
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Text Message Test */}
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '20px', 
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h3>Send Text Message</h3>
        <form onSubmit={sendTextMessage}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your test message..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={loading || !phoneNumber || !message}
            style={{
              padding: '10px 20px',
              backgroundColor: '#25d366',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Send Text Message
          </button>
        </form>
      </div>

      {/* Template Message Test */}
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '20px', 
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h3>Send Template Message</h3>
        <select
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginRight: '10px',
            fontSize: '14px'
          }}
        >
          <option value="hello_world">Hello World</option>
          <option value="customer_support">Customer Support</option>
        </select>
        <button
          onClick={sendTemplate}
          disabled={loading || !phoneNumber}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send Template
        </button>
      </div>

      {/* Results */}
      <div>
        <h3>Test Results</h3>
        {results.length === 0 ? (
          <p style={{ color: '#666' }}>No tests run yet</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.map(result => (
              <div key={result.id} style={{
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: result.status === 'Sent' || result.status === 'Success' ? '#f8f9fa' : '#fff5f5'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {result.type} - {result.status} ({result.timestamp})
                </div>
                <pre style={{ 
                  fontSize: '12px', 
                  backgroundColor: '#f8f9fa', 
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto'
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

export default MessageTest;