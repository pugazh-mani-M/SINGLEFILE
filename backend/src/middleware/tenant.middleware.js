const logger = require('../utils/logger.mock');

/**
 * Tenant isolation middleware
 * Ensures users can only access data from their own business/tenant
 */
const tenantIsolation = async (req, res, next) => {
  try {
    // Extract business/tenant ID from user context
    // This assumes the auth middleware has already run and set req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Set businessId from user context
    // This will be used in controllers to filter data
    req.user.businessId = req.user.businessId || req.user.agentId; // Fallback for compatibility
    
    next();
  } catch (error) {
    logger.error('Tenant isolation error', {
      error: error.message,
      userId: req.user?.agentId
    });

    res.status(500).json({
      success: false,
      message: 'Tenant isolation error'
    });
  }
};

/**
 * Validate business ownership of resource
 */
const validateBusinessOwnership = (resourceBusinessIdField = 'businessId') => {
  return (req, res, next) => {
    try {
      const userBusinessId = req.user.businessId;
      const resourceBusinessId = req.body[resourceBusinessIdField] || 
                                req.params[resourceBusinessIdField] ||
                                req.query[resourceBusinessIdField];

      if (resourceBusinessId && resourceBusinessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Resource belongs to different business.'
        });
      }

      next();
    } catch (error) {
      logger.error('Business ownership validation error', {
        error: error.message,
        userId: req.user?.agentId
      });

      res.status(500).json({
        success: false,
        message: 'Ownership validation error'
      });
    }
  };
};

module.exports = {
  tenantIsolation,
  validateBusinessOwnership
};