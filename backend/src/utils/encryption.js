const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * Get encryption key from environment or generate one
 */
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  // If key is hex string, convert to buffer
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // If key is base64, convert to buffer
  if (key.length === 44 && key.endsWith('=')) {
    return Buffer.from(key, 'base64');
  }
  
  // Otherwise, hash the key to get consistent 32-byte key
  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypt sensitive data
 */
const encrypt = (text) => {
  try {
    if (!text) return null;
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    
    cipher.setAAD(Buffer.from('whatsapp-crm', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv, tag, and encrypted data
    const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    
    return result;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt sensitive data
 */
const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('whatsapp-crm', 'utf8'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Hash password with salt
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verify password against hash
 */
const verifyPassword = (password, hashedPassword) => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    return false;
  }
};

/**
 * Generate secure random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate API key
 */
const generateApiKey = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `wcrm_${timestamp}_${random}`;
};

/**
 * Hash API key for storage
 */
const hashApiKey = (apiKey) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

/**
 * Generate webhook signature
 */
const generateWebhookSignature = (payload, secret) => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Encrypt object (for storing complex data)
 */
const encryptObject = (obj) => {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
  } catch (error) {
    throw new Error(`Object encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt object
 */
const decryptObject = (encryptedData) => {
  try {
    const jsonString = decrypt(encryptedData);
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Object decryption failed: ${error.message}`);
  }
};

/**
 * Generate encryption key (for setup)
 */
const generateEncryptionKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

/**
 * Mask sensitive data for logging
 */
const maskSensitiveData = (data, fields = ['password', 'token', 'key', 'secret']) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const masked = { ...data };
  
  for (const field of fields) {
    if (masked[field]) {
      const value = masked[field].toString();
      if (value.length <= 4) {
        masked[field] = '***';
      } else {
        masked[field] = value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
      }
    }
  }
  
  return masked;
};

/**
 * Secure compare for preventing timing attacks
 */
const secureCompare = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateApiKey,
  hashApiKey,
  generateWebhookSignature,
  verifyWebhookSignature,
  encryptObject,
  decryptObject,
  generateEncryptionKey,
  maskSensitiveData,
  secureCompare
};