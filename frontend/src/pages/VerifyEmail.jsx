import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from localStorage or URL params
    const storedEmail = localStorage.getItem('pendingEmail') || 'your-email@example.com';
    setEmail(storedEmail);
    
    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete verification code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      if (response.ok) {
        localStorage.removeItem('pendingEmail');
        window.location.href = '/login';
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setResendTimer(60);
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError('Failed to resend code');
    }
  };

  return (
    <div className="auth-container verify-email">
      <div className="auth-grid">
        {/* Left Section */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="whatsapp-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
              </svg>
            </div>
            <h1>Verify Your Email</h1>
            <p>We've sent a verification code to your email address</p>
          </div>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Email Verification</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span>Secure Account</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Almost Ready</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="auth-right">
          <div className="auth-form-container">
            <h2>Enter Verification Code</h2>
            <p style={{color: '#94a3b8', textAlign: 'center', marginBottom: '24px'}}>
              Code sent to {email}
            </p>
            
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="otp-container" style={{display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px'}}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    style={{
                      width: '48px',
                      height: '48px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: '600',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    autoComplete="off"
                  />
                ))}
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div style={{textAlign: 'center', marginTop: '20px'}}>
              {resendTimer > 0 ? (
                <span style={{color: '#94a3b8', fontSize: '14px'}}>
                  Resend code in {resendTimer}s
                </span>
              ) : (
                <button 
                  onClick={handleResend}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#14b8a6',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="auth-footer">
              <p>Wrong email? <Link to="/register">Go back to registration</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;