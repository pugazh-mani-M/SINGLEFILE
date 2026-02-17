import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../services/SocketContext';
import { useAuth } from '../services/AuthContext';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    database: 'checking',
    whatsapp: 'checking',
    socket: 'checking',
    auth: 'checking'
  });
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    // Check Backend Health
    try {
      await axios.get('/api/health');
      setStatus(prev => ({ ...prev, backend: 'online' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: 'offline' }));
    }

    // Check Database
    try {
      await axios.get('/api/conversations');
      setStatus(prev => ({ ...prev, database: 'online' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, database: 'offline' }));
    }

    // Check WhatsApp API (mock check for development)
    setStatus(prev => ({ 
      ...prev, 
      whatsapp: 'configured'
    }));

    // Check Socket
    setStatus(prev => ({ ...prev, socket: connected ? 'connected' : 'disconnected' }));

    // Check Auth
    setStatus(prev => ({ ...prev, auth: user ? 'authenticated' : 'not-authenticated' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'authenticated':
      case 'configured':
        return '#10b981';
      case 'offline':
      case 'disconnected':
      case 'not-authenticated':
      case 'not-configured':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: 'var(--text-color)' }}>
        WhatsApp CRM System Status
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(status).map(([service, serviceStatus]) => (
          <div 
            key={service}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--card-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div>
              <h4 style={{ margin: 0, textTransform: 'capitalize', color: 'var(--text-color)' }}>
                {service === 'whatsapp' ? 'WhatsApp API' : service}
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {getServiceDescription(service, serviceStatus)}
              </p>
            </div>
            <div 
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(serviceStatus)
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={checkSystemStatus}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh Status
          </button>
          
          <button 
            onClick={() => window.location.href = '/health'}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Backend Health
          </button>
        </div>
      </div>
    </div>
  );
};

const getServiceDescription = (service, status) => {
  switch (service) {
    case 'backend':
      return status === 'online' ? 'API server is running' : 'API server is down';
    case 'database':
      return status === 'online' ? 'Database is accessible' : 'Database connection failed';
    case 'whatsapp':
      return status === 'configured' ? 'WhatsApp API configured' : 'WhatsApp API not configured';
    case 'socket':
      return status === 'connected' ? 'Real-time connection active' : 'Real-time connection failed';
    case 'auth':
      return status === 'authenticated' ? 'User is logged in' : 'User not authenticated';
    default:
      return 'Checking...';
  }
};

export default SystemStatus;