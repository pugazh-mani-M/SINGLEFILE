// Validation utilities
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhoneNumber = (phone) => {
  // WhatsApp format: country code + number (no + sign)
  const re = /^\d{10,15}$/;
  return re.test(phone.replace(/\D/g, ''));
};

const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};

// Date utilities
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

// Message utilities
const truncateMessage = (message, maxLength = 50) => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

module.exports = {
  validateEmail,
  validatePhoneNumber,
  formatPhoneNumber,
  formatTimestamp,
  truncateMessage
};