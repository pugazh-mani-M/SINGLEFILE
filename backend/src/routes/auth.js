const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dbService = require('../services/devDatabaseService');
const RefreshToken = require('../models/RefreshToken.model');
const { auth } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
  sensitiveOperationLimit
} = require('../middleware/inputValidation');

const router = express.Router();

// In-memory OTP storage (use Redis in production)
const otpStore = {};

// Send OTP for phone/email verification
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email, type } = req.body;
    const identifier = phone || email;
    
    if (!identifier) {
      return res.status(400).json({ message: 'Phone number or email is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore[identifier] = {
      otp,
      type,
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };

    // In production, send SMS/email here
    console.log(`📱 OTP for ${identifier}: ${otp}`);
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, otp } = req.body;
    const identifier = phone || email;
    
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Identifier and OTP are required' });
    }

    const storedOtp = otpStore[identifier];
    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    if (Date.now() > storedOtp.expires) {
      delete otpStore[identifier];
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedOtp.attempts >= 3) {
      delete otpStore[identifier];
      return res.status(400).json({ message: 'Too many failed attempts' });
    }

    if (storedOtp.otp !== otp) {
      storedOtp.attempts++;
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route - supports both email/password and phone/OTP
router.post('/login',
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email, method: req.body.method });
    const { email, phone, password, otp, method } = req.body;

    if (method === 'phone') {
      if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required' });
      }

      // Verify OTP
      const storedOtp = otpStore[phone];
      if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Find agent by phone
      const agent = await dbService.getAgentByPhone(phone);
      if (!agent) {
        return res.status(404).json({ message: 'Account not found' });
      }

      // Clear OTP
      delete otpStore[phone];

      // Generate access and refresh tokens
      const accessToken = jwt.sign(
        { agentId: agent.agentId, phone: agent.phone },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { agentId: agent.agentId, phone: agent.phone },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Store refresh token in database
      await RefreshToken.create({
        token: refreshToken,
        userId: agent.agentId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }).catch(err => console.warn('RefreshToken save failed:', err.message));

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        agent: {
          agentId: agent.agentId,
          name: agent.name,
          phone: agent.phone
        }
      });
    } else {
      // Email login with password
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      console.log('Looking up agent by email:', email);
      const agent = await dbService.getAgentByEmail(email);
      if (!agent) {
        console.log('Agent not found for email:', email);
        return res.status(404).json({ message: 'Account not found' });
      }

      console.log('Agent found:', { agentId: agent.agentId, email: agent.email });

      if (!agent.passwordHash) {
        console.log('No password hash found');
        return res.status(400).json({ message: 'This account uses phone login. Please use phone/OTP method.' });
      }

      console.log('Comparing passwords...');
      const isValidPassword = await bcrypt.compare(password, agent.passwordHash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Generate access and refresh tokens
      const accessToken = jwt.sign(
        { agentId: agent.agentId, email: agent.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { agentId: agent.agentId, email: agent.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Store refresh token in database
      await RefreshToken.create({
        token: refreshToken,
        userId: agent.agentId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }).catch(err => console.warn('RefreshToken save failed:', err.message));

      console.log('Login successful for:', agent.email);
      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        agent: {
          agentId: agent.agentId,
          name: agent.name,
          email: agent.email,
          role: agent.role
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Registration route - phone registration without password
router.post('/register',
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      businessName, 
      businessType, 
      businessAddress, 
      businessPhone, 
      website, 
      method 
    } = req.body;

    if (method === 'phone') {
      if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone number are required' });
      }

      // Check if phone already exists
      const existingAgent = await dbService.getAgentByPhone(phone);
      if (existingAgent) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }

      // Create agent without password
      const agent = await dbService.createAgent({
        name,
        phone,
        businessName,
        businessType,
        businessAddress,
        businessPhone,
        website,
        method: 'phone'
      });

      const token = jwt.sign(
        { agentId: agent.agentId, phone: agent.phone },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        agent: {
          agentId: agent.agentId,
          name: agent.name,
          phone: agent.phone
        }
      });
    } else {
      // Email registration with password
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      if (!businessName) {
        return res.status(400).json({ message: 'Business name is required' });
      }

      const existingAgent = await dbService.getAgentByEmail(email);
      if (existingAgent) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`📧 Registration OTP for ${email}: ${otp}`);

      const hashedPassword = await bcrypt.hash(password, 10);
      const agent = await dbService.createAgent({
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        businessName,
        businessType,
        businessAddress,
        businessPhone,
        website,
        method: 'email'
      });

      const token = jwt.sign(
        { agentId: agent.agentId, email: agent.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        agent: {
          agentId: agent.agentId,
          name: agent.name,
          email: agent.email,
          businessName: agent.businessName
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      agent: {
        agentId: req.user.agentId,
        email: req.user.email,
        phone: req.user.phone,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Forgot password - send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const agent = await dbService.getAgentByEmail(email);
    if (!agent) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (10 minutes)
    otpStore[`reset_${email}`] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0
    };

    // In production, send email here
    console.log(`🔐 Password reset OTP for ${email}: ${otp}`);
    
    res.json({ message: 'Password reset code sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStore[`reset_${email}`];
    if (!storedData) {
      return res.status(400).json({ error: 'Reset code expired or invalid' });
    }

    if (Date.now() > storedData.expires) {
      delete otpStore[`reset_${email}`];
      return res.status(400).json({ error: 'Reset code expired' });
    }

    if (storedData.attempts >= 3) {
      delete otpStore[`reset_${email}`];
      return res.status(400).json({ error: 'Too many failed attempts' });
    }

    if (storedData.otp !== otp) {
      storedData.attempts++;
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    res.json({ message: 'Reset code verified successfully' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Verify OTP one more time
    const storedData = otpStore[`reset_${email}`];
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expires) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Get user
    const agent = await dbService.getAgentByEmail(email);
    if (!agent) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await dbService.updateAgent(agent.agentId, { passwordHash });

    // Clean up OTP
    delete otpStore[`reset_${email}`];

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email verification route
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // For development, accept any 6-digit OTP
    if (otp.length === 6) {
      console.log(`✅ Email verification successful for: ${email}`);
      res.json({ message: 'Email verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid OTP code' });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate new OTP for development
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📧 New verification OTP for ${email}: ${otp}`);
    
    res.json({ message: 'Verification code resent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if token exists and not revoked
    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
    
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { agentId: decoded.agentId, email: decoded.email, phone: decoded.phone },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate new refresh token (rotation)
    const newRefreshToken = jwt.sign(
      { agentId: decoded.agentId, email: decoded.email, phone: decoded.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Revoke old token
    storedToken.revokedAt = new Date();
    await storedToken.save();

    // Store new refresh token
    await RefreshToken.create({
      token: newRefreshToken,
      userId: decoded.agentId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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