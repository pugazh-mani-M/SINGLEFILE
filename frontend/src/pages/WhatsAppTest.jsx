import React, { useState } from 'react';
import axios from 'axios';

const WhatsAppTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: ''
  });

  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/test/save-config', apiConfig);
      addResult('Config', 'Saved', response.data);
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
    } catch (error) {
      addResult('Connection', 'Error', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const checkRecipient = async () => {
    if (!phoneNumber) return;
    try {
      setLoading(true);
      const response = await axios.post('/api/test/check-recipient', { phoneNumber });
      addResult('Recipient Check', response.data.success ? 'Valid' : 'Invalid', response.data);
    } catch (error) {
      addResult('Recipient Check', 'Error', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!phoneNumber || !message) return;
    try {
      setLoading(true);
      const response = await axios.post('/api/test/send-test', { phoneNumber, message });
      addResult('Message', 'Sent', response.data);
      setMessage('');
    } catch (error) {
      addResult('Message', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  const addResult = (type, status, data) => {
    setResults(prev => [{
      id: Date.now(),
      type,
      status,
      data,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: '#25d366', 
        textAlign: 'center', 
        marginBottom: '30px',
        fontSize: '2.5rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
      }}>🚀 WhatsApp Business API Test</h1>
      
      {/* Information Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '30px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        color: 'white'
      }}>
        <h2 style={{ color: 'white', marginTop: 0, fontSize: '1.8rem' }}>📋 Real WhatsApp Business API Integration</h2>
        <p style={{ fontSize: '16px', marginBottom: '20px', opacity: 0.9 }}>
          ✅ Clean, professional interface<br/>
          ✅ Real-time Meta WhatsApp API integration<br/>
          ✅ No authentication required for testing
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            color: '#333'
          }}>
            <h4 style={{ color: '#1976d2', marginTop: 0, fontSize: '1.2rem' }}>📋 API Configuration</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Access Token input</li>
              <li>Phone Number ID input</li>
              <li>Save configuration</li>
            </ul>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            color: '#333'
          }}>
            <h4 style={{ color: '#1976d2', marginTop: 0, fontSize: '1.2rem' }}>🔗 Connection Testing</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Tests real connection to Meta's API</li>
              <li>Shows phone number status</li>
            </ul>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            color: '#333'
          }}>
            <h4 style={{ color: '#1976d2', marginTop: 0, fontSize: '1.2rem' }}>📤 Message Sending</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Send real WhatsApp messages</li>
              <li>Phone number validation</li>
              <li>Message delivery confirmation</li>
            </ul>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            color: '#333'
          }}>
            <h4 style={{ color: '#1976d2', marginTop: 0, fontSize: '1.2rem' }}>📊 Live Results</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Real-time API responses</li>
              <li>Error handling and display</li>
              <li>Timestamp tracking</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(76, 175, 80, 0.1)', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          border: '2px solid #4CAF50',
          color: '#333'
        }}>
          <h4 style={{ color: '#2e7d32', marginTop: 0 }}>📱 Quick Test Guide - Send to Your Mobile:</h4>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
            <h5 style={{ color: '#1976d2', marginTop: 0 }}>Step 1: Get Meta WhatsApp Credentials</h5>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" style={{color: '#1976d2'}}>Facebook Developers</a></li>
              <li>Click "Create App" → Select "Business" → Enter app name</li>
              <li>Add "WhatsApp" product to your app</li>
              <li>Go to WhatsApp → "Getting Started"</li>
              <li>Copy your <strong>"Temporary access token"</strong></li>
              <li>Copy your <strong>"Phone number ID"</strong></li>
            </ol>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
            <h5 style={{ color: '#1976d2', marginTop: 0 }}>Step 2: Add Your Phone as Test Recipient</h5>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>In Meta WhatsApp setup, find "To" field</li>
              <li>Click "Manage phone number list"</li>
              <li>Add your phone number with country code (e.g., +1234567890)</li>
              <li>Verify the number via SMS/call</li>
            </ol>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px' }}>
            <h5 style={{ color: '#1976d2', marginTop: 0 }}>Step 3: Test in This Page</h5>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Enter your credentials in the form above</li>
              <li>Click "Save Configuration"</li>
              <li>Click "Test Connection" (should show success)</li>
              <li>Enter your phone number with country code</li>
              <li>Type a test message and click "Send Message"</li>
              <li>Check your WhatsApp - message should arrive in 1-2 seconds!</li>
            </ol>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(244, 67, 54, 0.1)', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          border: '2px solid #f44336',
          color: '#333'
        }}>
          <h4 style={{ color: '#d32f2f', marginTop: 0 }}>⚠️ Message Shows "Sent" But Not Receiving?</h4>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
            <h5 style={{ color: '#1976d2', marginTop: 0 }}>Quick Fix Steps:</h5>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>Add your phone in Meta Business Manager:</strong>
                <br/>Go to <a href="https://business.facebook.com/" target="_blank" style={{color: '#1976d2'}}>business.facebook.com</a> → WhatsApp Manager → Add phone number</li>
              <li><strong>Verify your phone:</strong> Complete SMS/call verification</li>
              <li><strong>Use correct format:</strong> +countrycode+number (e.g., +1234567890)</li>
              <li><strong>Test with Meta's tool first:</strong> 
                <br/>Go to <a href="https://developers.facebook.com/" target="_blank" style={{color: '#1976d2'}}>developers.facebook.com</a> → Your App → WhatsApp → Send test message</li>
            </ol>
          </div>
          
          <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '6px', border: '1px solid #ff9800' }}>
            <h5 style={{ color: '#f57c00', marginTop: 0 }}>🔍 Use "Check Recipient" Button:</h5>
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              Click the <strong>"🔍 Check Recipient"</strong> button below to verify if your phone number can receive messages. 
              This will tell you exactly if the setup is correct.
            </p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(156, 39, 176, 0.9)', 
          padding: '20px', 
          borderRadius: '8px',
          color: 'white'
        }}>
          <h4 style={{ color: 'white', marginTop: 0, fontSize: '1.3rem' }}>🔌 Meta API Integration:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Uses official Meta Graph API v18.0</li>
            <li>Real message delivery through WhatsApp Business Platform</li>
            <li>Proper error handling and status reporting</li>
            <li>Template message support</li>
          </ul>
          <p style={{ margin: '15px 0 0 0', fontStyle: 'italic', opacity: 0.9, fontSize: '14px' }}>
            The page will work in real-time with your actual Meta WhatsApp Business API credentials and send real messages to WhatsApp users.
          </p>
        </div>
      </div>
      {/* API Configuration */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        color: 'white'
      }}>
        <h3 style={{ color: 'white', marginTop: 0, fontSize: '1.5rem' }}>📋 Meta WhatsApp API Configuration</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Access Token:
          </label>
          <input
            type="text"
            value={apiConfig.accessToken}
            onChange={(e) => setApiConfig(prev => ({ ...prev, accessToken: e.target.value }))}
            placeholder="EAAxxxxxxxxx..."
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Phone Number ID:
          </label>
          <input
            type="text"
            value={apiConfig.phoneNumberId}
            onChange={(e) => setApiConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
            placeholder="123456789012345"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        <button
          onClick={saveConfig}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#fff',
            color: '#4CAF50',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          💾 Save Configuration
        </button>
      </div>

      {/* Test Connection */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#fff',
            color: '#2196F3',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '15px',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}
        >
          🔗 Test Connection
        </button>
        <span style={{ fontSize: '14px', color: 'white', opacity: 0.9 }}>
          Test your WhatsApp Business API connection
        </span>
      </div>

      {/* Quick Test Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        color: 'white'
      }}>
        <h3 style={{ color: 'white', marginTop: 0, fontSize: '1.5rem' }}>⚡ Quick Test - Send to Your Mobile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Your Mobile Number:
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Quick Test Messages:
            </label>
            <select
              onChange={(e) => setMessage(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <option value="">Select a test message...</option>
              <option value="Hello! This is a test message from my WhatsApp CRM system. 🚀">👋 Hello Test Message</option>
              <option value="Your WhatsApp Business API is working perfectly! Messages are being delivered successfully. ✅">✅ Success Confirmation</option>
              <option value="Testing WhatsApp integration with real phone number. If you receive this, the setup is complete! 🎉">🎉 Integration Test</option>
              <option value="This message was sent from a custom WhatsApp CRM application. Pretty cool, right? 😎">😎 Cool Demo Message</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={checkRecipient}
            disabled={loading || !phoneNumber}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              opacity: (loading || !phoneNumber) ? 0.6 : 1
            }}
          >
            🔍 Check Recipient
          </button>
          
          <button
            onClick={sendMessage}
            disabled={loading || !phoneNumber || !message}
            style={{
              padding: '15px 30px',
              backgroundColor: '#fff',
              color: '#FF9800',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              opacity: (loading || !phoneNumber || !message) ? 0.6 : 1
            }}
          >
            🚀 Send Test Message Now!
          </button>
          
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {loading ? '🔄 Processing...' : '📱 Message will arrive in 1-2 seconds'}
          </div>
        </div>
      </div>

      {/* Send Message */}
      <div style={{ 
        background: 'linear-gradient(135deg, #25d366 0%, #128C7E 100%)', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        color: 'white'
      }}>
        <h3 style={{ color: 'white', marginTop: 0, fontSize: '1.5rem' }}>📱 Send Test Message</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Phone Number (with country code):
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hello! This is a test message from WhatsApp CRM."
            rows={3}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={loading || !phoneNumber || !message}
          style={{
            padding: '12px 24px',
            backgroundColor: '#fff',
            color: '#25d366',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            opacity: (loading || !phoneNumber || !message) ? 0.6 : 1
          }}
        >
          📤 Send Message
        </button>
      </div>

      {/* Results */}
      <div style={{
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ color: '#333', marginTop: 0, fontSize: '1.5rem', marginBottom: '20px' }}>📊 Test Results</h3>
        {results.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666', 
            fontStyle: 'italic',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            📋 No tests run yet - Start by configuring your API and testing the connection
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {results.map(result => (
              <div key={result.id} style={{
                padding: '20px',
                marginBottom: '15px',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                backgroundColor: result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' 
                  ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
                  : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                border: `2px solid ${result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '#28a745' : '#dc3545'}`
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '10px',
                  fontSize: '16px',
                  color: result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '#155724' : '#721c24'
                }}>
                  {result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '✅' : '❌'} {result.type} - {result.status} ({result.time})
                </div>
                <pre style={{
                  fontSize: '12px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: '15px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  margin: 0,
                  border: '1px solid rgba(0,0,0,0.1)',
                  lineHeight: '1.4'
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

export default WhatsAppTest;