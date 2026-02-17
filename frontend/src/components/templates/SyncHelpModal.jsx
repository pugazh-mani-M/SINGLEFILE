import React from 'react';

const SyncHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">WhatsApp Template Sync</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-body">
          <div style={{ padding: '20px', lineHeight: '1.6' }}>
            <h3 style={{ color: '#3b82f6', marginBottom: '16px' }}>What is "Sync with Meta"?</h3>
            <p style={{ marginBottom: '16px' }}>This feature synchronizes your WhatsApp message templates between your CRM and Meta's WhatsApp Business Platform.</p>
            
            <h4 style={{ color: '#1f2937', marginBottom: '12px' }}>Purpose:</h4>
            <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
              <li>Check template approval status (APPROVED, PENDING, REJECTED)</li>
              <li>Download templates created in Meta Business Manager</li>
              <li>Ensure both systems have the same data</li>
              <li>Track which templates are ready to use</li>
            </ul>
            
            <h4 style={{ color: '#1f2937', marginBottom: '12px' }}>When to use:</h4>
            <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
              <li>After creating new templates</li>
              <li>To check if templates are approved by Meta</li>
              <li>Before sending broadcast messages</li>
              <li>For regular maintenance</li>
            </ul>
            
            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
              <strong style={{ color: '#0369a1' }}>Current Status:</strong>
              <p style={{ margin: '8px 0 0 0', color: '#0369a1' }}>Running in development mode with mock data. In production, this connects to Meta's real WhatsApp Business API.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncHelpModal;