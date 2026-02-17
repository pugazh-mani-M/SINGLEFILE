const jwt = require('jsonwebtoken');

// Token blacklist (use Redis in production)
const tokenBlacklist = new Set();

const jwtUtils = {
  // Generate access token (short-lived)
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'whatsapp-crm',
      audience: 'whatsapp-crm-api'
    });
  },

  // Generate refresh token (long-lived)
  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'whatsapp-crm',
      audience: 'whatsapp-crm-api'
    });
  },

  // Verify token
  verifyToken(token, isRefresh = false) {
    const secret = isRefresh 
      ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
      : process.env.JWT_SECRET;

    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    return jwt.verify(token, secret, {
      issuer: 'whatsapp-crm',
      audience: 'whatsapp-crm-api'
    });
  },

  // Revoke token (logout)
  revokeToken(token) {
    tokenBlacklist.add(token);
    // In production: store in Redis with TTL matching token expiry
  },

  // Generate token pair
  generateTokenPair(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
};

module.exports = jwtUtils;
