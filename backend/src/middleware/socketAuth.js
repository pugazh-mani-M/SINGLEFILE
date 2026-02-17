const jwt = require('jsonwebtoken');
const dbService = require('../services/devDatabaseService');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await dbService.getAgent(decoded.agentId);
    
    if (!agent || !agent.isActive) {
      return next(new Error('Authentication error: Invalid or inactive user'));
    }

    socket.user = {
      agentId: agent.agentId,
      email: agent.email,
      name: agent.name,
      role: agent.role
    };
    
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    return next(new Error('Authentication error: ' + error.message));
  }
};

module.exports = { authenticateSocket };