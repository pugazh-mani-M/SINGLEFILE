import React from 'react';

const TemplateStatus = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { className: 'status-approved', text: 'Approved', icon: '✓' };
      case 'PENDING':
        return { className: 'status-pending', text: 'Pending', icon: '⏳' };
      case 'REJECTED':
        return { className: 'status-rejected', text: 'Rejected', icon: '✗' };
      case 'DISABLED':
        return { className: 'status-disabled', text: 'Disabled', icon: '⏸' };
      default:
        return { className: 'status-disabled', text: 'Unknown', icon: '?' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge ${config.className}`}>
      <span className="icon">{config.icon}</span>
      {config.text}
    </span>
  );
};

export default TemplateStatus;