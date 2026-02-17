import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const Settings = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [metaVerified, setMetaVerified] = useState(false);
  const [showMetaDetails, setShowMetaDetails] = useState(false);
  const [metaStatus, setMetaStatus] = useState({
    businessAccount: false,
    facebookPage: false,
    whatsappBusiness: false,
    businessManagerId: 'Not Available',
    metaAppId: 'Not Available',
    webhookVerified: false,
    lastSync: 'Never',
    permissions: {
      leads_retrieval: false,
      pages_manage_metadata: true,
      whatsapp_business_messaging: true,
      business_management: false
    }
  });

  const checkMetaVerification = async () => {
    try {
      const response = await axios.get('/api/whatsapp/verification-status');
      setMetaVerified(response.data.verified);
    } catch (error) {
      console.error('Error checking Meta verification:', error);
      setMetaVerified(false);
    }
  };

  useEffect(() => {
    checkMetaVerification();
  }, []);

  const getPermissionTooltip = (permission) => {
    const tooltips = {
      leads_retrieval: 'Access to retrieve lead information from Meta platforms',
      pages_manage_metadata: 'Manage Facebook page information and settings',
      whatsapp_business_messaging: 'Send and receive WhatsApp Business messages',
      business_management: 'Manage Business Manager account and assets'
    };
    return tooltips[permission] || 'Permission description not available';
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account and application preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preferences
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
              </svg>
              Notifications
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveTab('mobile')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile Integration
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </button>
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <div className="profile-card">
                <div className="profile-avatar">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{user?.name}</h3>
                  <p>{user?.email}</p>
                  <span className="role-badge">{user?.role}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" defaultValue={user?.name} onChange={(e) => console.log('Name changed:', e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" defaultValue={user?.email} disabled />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+1 (555) 123-4567" onChange={(e) => console.log('Phone changed:', e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <select onChange={(e) => console.log('Department changed:', e.target.value)}>
                  <option>Customer Support</option>
                  <option>Sales</option>
                  <option>Technical</option>
                </select>
              </div>
              
              <button className="btn btn-primary" onClick={() => alert('Profile updated!')}>Update Profile</button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Application Preferences</h2>
              
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Dark Mode</h4>
                  <p>Switch between light and dark themes</p>
                </div>
                <button 
                  className={`toggle-switch ${isDark ? 'active' : ''}`}
                  onClick={toggleTheme}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
              
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Language</h4>
                  <p>Choose your preferred language</p>
                </div>
                <select className="preference-select" onChange={(e) => console.log('Language changed:', e.target.value)}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Time Zone</h4>
                  <p>Set your local time zone</p>
                </div>
                <select className="preference-select" onChange={(e) => console.log('Timezone changed:', e.target.value)}>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC+0 (GMT)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              
              <div className="notification-group">
                <h4>Message Notifications</h4>
                <div className="notification-item">
                  <span>New message alerts</span>
                  <input type="checkbox" defaultChecked onChange={(e) => console.log('Message alerts:', e.target.checked)} />
                </div>
                <div className="notification-item">
                  <span>Sound notifications</span>
                  <input type="checkbox" defaultChecked onChange={(e) => console.log('Sound notifications:', e.target.checked)} />
                </div>
              </div>
              
              <div className="notification-group">
                <h4>System Notifications</h4>
                <div className="notification-item">
                  <span>Assignment updates</span>
                  <input type="checkbox" defaultChecked onChange={(e) => console.log('Assignment updates:', e.target.checked)} />
                </div>
                <div className="notification-item">
                  <span>Status changes</span>
                  <input type="checkbox" onChange={(e) => console.log('Status changes:', e.target.checked)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mobile' && (
            <div className="settings-section">
              <h2>Mobile Integration</h2>
              
              <div className="mobile-section">
                <h4>WhatsApp Business Integration</h4>
                <div className="integration-card">
                  <div className={`integration-status ${metaVerified ? 'connected' : 'pending'}`}>
                    <span className="status-dot"></span>
                    {metaVerified ? 'Verified' : 'Pending Verification'}
                  </div>
                  <p>{metaVerified ? 'Your WhatsApp Business account is verified and active.' : 'Your account is under Meta review. This may take 1-3 business days.'}</p>
                  <button className="btn btn-secondary" onClick={() => checkMetaVerification()}>Check Status</button>
                </div>
              </div>
              
              <div className="mobile-section">
                <div className="section-header" onClick={() => setShowMetaDetails(!showMetaDetails)}>
                  <h4>Meta Verification & Compliance</h4>
                  <span className={`collapse-icon ${showMetaDetails ? 'expanded' : ''}`}>▼</span>
                </div>
                {showMetaDetails && (
                  <div className="meta-details">
                    <div className="verification-progress">
                      <div className="progress-steps">
                        <div className={`step ${metaStatus.businessAccount ? 'completed' : 'pending'}`}>
                          <span className="step-number">1</span>
                          <span className="step-label">Business Manager Connected</span>
                        </div>
                        <div className={`step ${metaStatus.facebookPage ? 'completed' : 'pending'}`}>
                          <span className="step-number">2</span>
                          <span className="step-label">Facebook Page Linked</span>
                        </div>
                        <div className={`step ${metaStatus.whatsappBusiness ? 'completed' : 'pending'}`}>
                          <span className="step-number">3</span>
                          <span className="step-label">WhatsApp Number Verified</span>
                        </div>
                        <div className={`step ${metaStatus.webhookVerified ? 'completed' : 'pending'}`}>
                          <span className="step-number">4</span>
                          <span className="step-label">Webhook Verified</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="meta-info-grid">
                      <div className="info-item">
                        <label>Business Manager ID</label>
                        <input type="text" value={metaStatus.businessManagerId} readOnly />
                      </div>
                      <div className="info-item">
                        <label>Meta App ID</label>
                        <input type="text" value={metaStatus.metaAppId} readOnly />
                      </div>
                      <div className="info-item">
                        <label>Last Sync</label>
                        <input type="text" value={metaStatus.lastSync} readOnly />
                      </div>
                    </div>
                    
                    <div className="permissions-section">
                      <h5>Permissions Status</h5>
                      <div className="permissions-grid">
                        {Object.entries(metaStatus.permissions).map(([key, enabled]) => (
                          <div key={key} className="permission-item" title={getPermissionTooltip(key)}>
                            <span className={`permission-status ${enabled ? 'enabled' : 'disabled'}`}>
                              {enabled ? '✓' : '✗'}
                            </span>
                            <span className="permission-name">{key.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {!metaStatus.businessAccount && (
                      <div className="warning-message">
                        <span className="warning-icon">⚠️</span>
                        Business Manager connection required for full functionality
                      </div>
                    )}
                    
                    {!metaStatus.webhookVerified && (
                      <div className="warning-message">
                        <span className="warning-icon">⚠️</span>
                        Webhook verification pending - real-time updates may be delayed
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mobile-section">
                <h4>Phone Number Settings</h4>
                <div className="form-group">
                  <label>Primary WhatsApp Number</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select style={{ width: '150px' }} onChange={(e) => console.log('Country changed:', e.target.value)}>
                      <option value="+91">🇮🇳 India (+91)</option>
                      <option value="+1">🇺🇸 USA (+1)</option>
                      <option value="+44">🇬🇧 UK (+44)</option>
                      <option value="+971">🇦🇪 UAE (+971)</option>
                      <option value="+61">🇦🇺 Australia (+61)</option>
                      <option value="+81">🇯🇵 Japan (+81)</option>
                      <option value="+86">🇨🇳 China (+86)</option>
                      <option value="+49">🇩🇪 Germany (+49)</option>
                      <option value="+33">🇫🇷 France (+33)</option>
                      <option value="+39">🇮🇹 Italy (+39)</option>
                      <option value="+34">🇪🇸 Spain (+34)</option>
                      <option value="+7">🇷🇺 Russia (+7)</option>
                      <option value="+55">🇧🇷 Brazil (+55)</option>
                      <option value="+27">🇿🇦 South Africa (+27)</option>
                      <option value="+52">🇲🇽 Mexico (+52)</option>
                      <option value="+82">🇰🇷 South Korea (+82)</option>
                      <option value="+65">🇸🇬 Singapore (+65)</option>
                      <option value="+60">🇲🇾 Malaysia (+60)</option>
                      <option value="+62">🇮🇩 Indonesia (+62)</option>
                      <option value="+63">🇵🇭 Philippines (+63)</option>
                      <option value="+66">🇹🇭 Thailand (+66)</option>
                      <option value="+84">🇻🇳 Vietnam (+84)</option>
                      <option value="+92">🇵🇰 Pakistan (+92)</option>
                      <option value="+880">🇧🇩 Bangladesh (+880)</option>
                      <option value="+94">🇱🇰 Sri Lanka (+94)</option>
                      <option value="+977">🇳🇵 Nepal (+977)</option>
                    </select>
                    <input type="tel" placeholder="1234567890" style={{ flex: 1 }} onChange={(e) => console.log('Phone changed:', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Display Name</label>
                  <input type="text" defaultValue="Customer Support" onChange={(e) => console.log('Display name changed:', e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={() => alert('Phone number updated successfully!')}>Update Number</button>
              </div>
              
              <div className="mobile-section">
                <h4>Message Templates</h4>
                <p>Manage your approved WhatsApp message templates.</p>
                <button className="btn btn-primary" onClick={() => alert('Navigate to Templates page')}>Manage Templates</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="security-item">
                <h4>Change Password</h4>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" onChange={(e) => console.log('Current password entered')} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" onChange={(e) => console.log('New password entered')} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" onChange={(e) => console.log('Password confirmed')} />
                </div>
                <button className="btn btn-primary" onClick={() => alert('Password updated!')}>Update Password</button>
              </div>
              
              <div className="security-item">
                <h4>Account Actions</h4>
                <button className="btn btn-danger" onClick={logout}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;