import React, { useState } from 'react';
import axios from 'axios';

const WhatsAppTest = () => {
  const [config, setConfig] = useState({ accessToken: '', phoneNumberId: '' });
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Hello! This is a test message from WhatsApp CRM 🚀');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const addResult = (type, status, data) => {
    setResults(prev => [{ id: Date.now(), type, status, data, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const saveConfig = async () => {
    if (!config.accessToken || !config.phoneNumberId) {
      alert('Please enter both Access Token and Phone Number ID');
      return;
    }
    try {
      setLoading(true);
      await axios.post('/api/test/save-config', config);
      addResult('Config', 'Saved', 'Configuration saved successfully');
      setStep(2);
    } catch (error) {
      addResult('Config', 'Failed', error.message);
    }
    setLoading(false);
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/test/test-connection');
      addResult('Connection', response.data.success ? 'Success' : 'Failed', response.data);
      if (response.data.success) setStep(3);
    } catch (error) {
      addResult('Connection', 'Error', error.message);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!phone || !message) {
      alert('Please enter phone number and message');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post('/api/test/send-test', { phoneNumber: phone, message });
      addResult('Message', 'Sent', response.data);
      alert('Message sent! Check your WhatsApp.');
    } catch (error) {
      addResult('Message', 'Failed', error.response?.data || error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ textAlign: 'center', color: '#25d366', marginBottom: '30px' }}>WhatsApp Business API Tester</h1>
      
      {/* Setup Instructions */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #444' }}>
        <h3 style={{ color: '#ffd700', marginTop: 0 }}>📋 Quick Setup (2 minutes):</h3>
        <ol style={{ color: 'white' }}>
          <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" style={{ color: '#25d366' }}>Facebook Developers</a></li>
          <li>Create App → Business → Add WhatsApp</li>
          <li>Copy Access Token and Phone Number ID</li>
          <li>Add your phone number as test recipient</li>
        </ol>
      </div>

      {/* Step 1: Configuration */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid ' + (step >= 1 ? '#25d366' : '#555') }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>Step 1: Configure API</h3>
        <input
          type="text"
          placeholder="Access Token (EAAxxxxxxxxx...)"
          value={config.accessToken}
          onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' }}
        />
        <input
          type="text"
          placeholder="Phone Number ID (15 digits)"
          value={config.phoneNumberId}
          onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' }}
        />
        <button
          onClick={saveConfig}
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#25d366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          💾 Save Configuration
        </button>
      </div>

      {/* Step 2: Test Connection */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid ' + (step >= 2 ? '#007bff' : '#555') }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>Step 2: Test Connection</h3>
        <button
          onClick={testConnection}
          disabled={loading || step < 2}
          style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: step < 2 ? 0.5 : 1 }}
        >
          🔗 Test Connection
        </button>
      </div>

      {/* Step 3: Send Message */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid ' + (step >= 3 ? '#ff9800' : '#555') }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>Step 3: Send Test Message</h3>
        
        {/* Country Code + Phone Number */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select
            value={phone.split(' ')[0] || '+1'}
            onChange={(e) => {
              const countryCode = e.target.value;
              const number = phone.split(' ')[1] || '';
              setPhone(countryCode + ' ' + number);
            }}
            style={{ padding: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white', minWidth: '120px' }}
          >
            <option value="+1">🇺🇸 +1 (US)</option>
            <option value="+44">🇬🇧 +44 (UK)</option>
            <option value="+91">🇮🇳 +91 (India)</option>
            <option value="+86">🇨🇳 +86 (China)</option>
            <option value="+49">🇩🇪 +49 (Germany)</option>
            <option value="+33">🇫🇷 +33 (France)</option>
            <option value="+81">🇯🇵 +81 (Japan)</option>
            <option value="+82">🇰🇷 +82 (Korea)</option>
            <option value="+55">🇧🇷 +55 (Brazil)</option>
            <option value="+61">🇦🇺 +61 (Australia)</option>
            <option value="+7">🇷🇺 +7 (Russia)</option>
            <option value="+39">🇮🇹 +39 (Italy)</option>
            <option value="+34">🇪🇸 +34 (Spain)</option>
            <option value="+31">🇳🇱 +31 (Netherlands)</option>
            <option value="+46">🇸🇪 +46 (Sweden)</option>
            <option value="+47">🇳🇴 +47 (Norway)</option>
            <option value="+45">🇩🇰 +45 (Denmark)</option>
            <option value="+41">🇨🇭 +41 (Switzerland)</option>
            <option value="+43">🇦🇹 +43 (Austria)</option>
            <option value="+32">🇧🇪 +32 (Belgium)</option>
          </select>
          <input
            type="tel"
            placeholder="1234567890"
            value={phone.split(' ')[1] || ''}
            onChange={(e) => {
              const countryCode = phone.split(' ')[0] || '+1';
              setPhone(countryCode + ' ' + e.target.value);
            }}
            style={{ flex: 1, padding: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' }}
          />
        </div>
        
        <textarea
          placeholder="Test message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' }}
        />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {[
            'Hello! Testing WhatsApp API 🚀',
            'Your WhatsApp CRM is working! ✅',
            'This is a test message 📱'
          ].map((msg, i) => (
            <button
              key={i}
              onClick={() => setMessage(msg)}
              style={{ padding: '8px 12px', backgroundColor: '#444', color: 'white', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              {msg.substring(0, 20)}...
            </button>
          ))}
        </div>
        <button
          onClick={sendMessage}
          disabled={loading || step < 3}
          style={{ padding: '15px 30px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', opacity: step < 3 ? 0.5 : 1 }}
        >
          📤 Send Message Now!
        </button>
      </div>

      {/* Results */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>📊 Results</h3>
        {results.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No tests run yet</p>
        ) : (
          results.map(result => (
            <div key={result.id} style={{
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '6px',
              backgroundColor: result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '#1a4d3a' : '#4d1a1a',
              border: '1px solid ' + (result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '#28a745' : '#dc3545')
            }}>
              <strong style={{ color: 'white' }}>{result.status === 'Success' || result.status === 'Sent' || result.status === 'Saved' ? '✅' : '❌'} {result.type} - {result.status} ({result.time})</strong>
              <pre style={{ fontSize: '12px', marginTop: '8px', whiteSpace: 'pre-wrap', color: '#ccc' }}>
                {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WhatsAppTest;