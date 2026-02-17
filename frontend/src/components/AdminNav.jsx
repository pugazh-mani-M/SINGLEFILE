import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';

const AdminNav = ({ currentView, onViewChange }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (user?.role !== 'admin') return null;

  const adminItems = [
    { id: 'inbox', label: 'Inbox', icon: '💬' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' }
  ];

  return (
    <div className="admin-nav">
      <button 
        className="admin-nav-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Admin Menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="admin-nav-menu">
          {adminItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                setIsExpanded(false);
              }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNav;