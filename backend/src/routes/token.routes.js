const express = require('express');
const RefreshToken = require('../models/RefreshToken.model');
const jwtUtils = require('../utils/jwtUtils');
const router = express.Router();

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify token
    const decoded = jwtUtils.verifyToken(refreshToken, true);
    
    // Check if token exists and not revoked
    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
    
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = jwtUtils.generateTokenPair({
      agentId: decoded.agentId,
      email: decoded.email
    });

    // Revoke old token and store new one
    storedToken.revokedAt = new Date();
    storedToken.replacedBy = newRefreshToken;
    await storedToken.save();

    // Store new refresh token
    await RefreshToken.create({
      token: newRefreshToken,
      userId: decoded.agentId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout - revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { revokedAt: new Date() }
      );
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
