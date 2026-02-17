const jwt = require('jsonwebtoken');
const dbService = require('../services/devDatabaseService');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.agentId) {
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    
    const agent = await dbService.getAgent(decoded.agentId);
    
    if (!agent) {
      return res.status(401).json({ error: 'Agent not found.' });
    }
    
    if (!agent.isActive) {
      return res.status(401).json({ error: 'Account is inactive.' });
    }

    req.user = {
      agentId: agent.agentId,
      email: agent.email,
      phone: agent.phone,
      name: agent.name,
      role: agent.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Socket.IO authentication
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await dbService.getAgent(decoded.agentId);
    
    if (!agent || !agent.isActive) {
      return next(new Error('Authentication error'));
    }

    socket.user = {
      agentId: agent.agentId,
      email: agent.email,
      name: agent.name,
      role: agent.role
    };
    
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

module.exports = { auth, adminOnly, authenticateSocket };