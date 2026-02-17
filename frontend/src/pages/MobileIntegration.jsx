import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import '../styles/mobile-integration.css';

const MobileIntegration = () => {
  const toast = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('select'); // select, verify, complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddNumber, setShowAddNumber] = useState(false);

  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  const loadPhoneNumbers = async () => {
    // Use mock data for development
    setPhoneNumbers([
      {
        id: '1',
        number: '+1234567890',
        country: 'United States',
        status: 'verified',
        verifiedAt: new Date().toISOString()
      },
      {
        id: '2', 
        number: '+0987654321',
        country: 'Canada',
        status: 'unverified'
      }
    ]);
  };

  const handleNumberSelect = (numberId) => {
    setSelectedNumber(numberId);
    const number = phoneNumbers.find(n => n.id === numberId);
    if (number.status === 'unverified') {
      setStep('verify');
    }
  };

  const handleVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`/api/mobile/numbers/${selectedNumber}/confirm`, {
        verificationCode
      });
      
      if (response.data.success) {
        // Update local state
        setPhoneNumbers(prev => 
          prev.map(n => 
            n.id === selectedNumber 
              ? { ...n, status: 'verified', verifiedAt: new Date().toISOString() }
              : n
          )
        );
        setStep('complete');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      const response = await axios.post(`/api/mobile/numbers/${selectedNumber}/verify`);
      if (response.data.success) {
        setError('');
        // In development, show the code
        if (response.data.verificationCode) {
          setError(`Dev Code: ${response.data.verificationCode}`);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send verification code');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'unverified': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="mobile-integration-container">
      <div className="integration-header">
        <h1>Mobile Number Integration</h1>
        <p>Connect your WhatsApp Business phone numbers</p>
      </div>

      {step === 'select' && (
        <div className="step-content">
          <h3>Select Phone Number</h3>
          <div className="phone-numbers-list">
            {phoneNumbers.map(phone => (
              <div 
                key={phone.id}
                className={`phone-number-card ${selectedNumber === phone.id ? 'selected' : ''}`}
                onClick={() => handleNumberSelect(phone.id)}
              >
                <div className="phone-info">
                  <div className="phone-number">{phone.number}</div>
                  <div className="phone-country">{phone.country}</div>
                </div>
                <div className="phone-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(phone.status) }}
                  >
                    {phone.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="integration-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddNumber(true)}>Add New Number</button>
            <button 
              className="btn btn-primary"
              disabled={!selectedNumber}
              onClick={() => {
                const number = phoneNumbers.find(n => n.id === selectedNumber);
                if (number.status === 'verified') {
                  setStep('complete');
                } else {
                  setStep('verify');
                }
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="step-content">
          <h3>Verify Phone Number</h3>
          <div className="verification-info">
            <p>We'll send a verification code to:</p>
            <div className="selected-number">
              {phoneNumbers.find(n => n.id === selectedNumber)?.number}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={sendVerificationCode}
              style={{ marginTop: '16px' }}
            >
              Send Code
            </button>
          </div>
          
          {error && (
            <div className={`error-message ${error.includes('Dev Code:') ? 'dev-code' : ''}`}>
              {error}
            </div>
          )}
          
          <div className="verification-form">
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            
            <div className="integration-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setStep('select')}
              >
                Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleVerification}
                disabled={verificationCode.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="step-content">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Integration Complete!</h3>
            <p>Your WhatsApp Business number is now connected</p>
            
            <div className="integration-details">
              <div className="detail-item">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">
                  {phoneNumbers.find(n => n.id === selectedNumber)?.number}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-verified">Verified</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Webhook:</span>
                <span className="detail-value">Connected</span>
              </div>
            </div>
            
            <div className="integration-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setStep('select')}
              >
                Manage Numbers
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showAddNumber && (
        <div className="modal-overlay" onClick={() => setShowAddNumber(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New WhatsApp Number</h2>
              <button onClick={() => setShowAddNumber(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Country</label>
                <select>
                  <option value="+91">🇮🇳 India (+91)</option>
                  <option value="+86">🇨🇳 China (+86)</option>
                  <option value="+81">🇯🇵 Japan (+81)</option>
                  <option value="+82">🇰🇷 South Korea (+82)</option>
                  <option value="+62">🇮🇩 Indonesia (+62)</option>
                  <option value="+63">🇵🇭 Philippines (+63)</option>
                  <option value="+84">🇻🇳 Vietnam (+84)</option>
                  <option value="+66">🇹🇭 Thailand (+66)</option>
                  <option value="+60">🇲🇾 Malaysia (+60)</option>
                  <option value="+65">🇸🇬 Singapore (+65)</option>
                  <option value="+92">🇵🇰 Pakistan (+92)</option>
                  <option value="+880">🇧🇩 Bangladesh (+880)</option>
                  <option value="+94">🇱🇰 Sri Lanka (+94)</option>
                  <option value="+977">🇳🇵 Nepal (+977)</option>
                  <option value="+95">🇲🇲 Myanmar (+95)</option>
                  <option value="+855">🇰🇭 Cambodia (+855)</option>
                  <option value="+856">🇱🇦 Laos (+856)</option>
                  <option value="+673">🇧🇳 Brunei (+673)</option>
                  <option value="+670">🇹🇱 Timor-Leste (+670)</option>
                  <option value="+976">🇲🇳 Mongolia (+976)</option>
                  <option value="+852">🇭🇰 Hong Kong (+852)</option>
                  <option value="+853">🇲🇴 Macau (+853)</option>
                  <option value="+886">🇹🇼 Taiwan (+886)</option>
                  <option value="+1">🇺🇸 USA (+1)</option>
                  <option value="+44">🇬🇧 UK (+44)</option>
                  <option value="+971">🇦🇪 UAE (+971)</option>
                  <option value="+61">🇦🇺 Australia (+61)</option>
                  <option value="+49">🇩🇪 Germany (+49)</option>
                  <option value="+33">🇫🇷 France (+33)</option>
                  <option value="+39">🇮🇹 Italy (+39)</option>
                  <option value="+34">🇪🇸 Spain (+34)</option>
                  <option value="+7">🇷🇺 Russia (+7)</option>
                  <option value="+55">🇧🇷 Brazil (+55)</option>
                  <option value="+27">🇿🇦 South Africa (+27)</option>
                  <option value="+52">🇲🇽 Mexico (+52)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="1234567890" />
              </div>
              <div className="form-group">
                <label>Business Name</label>
                <input type="text" placeholder="Your Business Name" />
              </div>
              <div className="form-actions">
                <button className="btn btn-cancel" onClick={() => setShowAddNumber(false)}>Cancel</button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { 
                    toast.success('Number added successfully!'); 
                    setShowAddNumber(false); 
                  }}
                >
                  Add Number
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileIntegration;