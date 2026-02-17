const logger = require('../utils/logger.mock');

/**
 * Permission definitions
 */
const PERMISSIONS = {
  templates: {
    view: ['owner', 'admin', 'agent', 'viewer'],
    create: ['owner', 'admin'],
    edit: ['owner', 'admin'],
    delete: ['owner', 'admin'],
    submit: ['owner', 'admin'],
    sync: ['owner', 'admin']
  },
  conversations: {
    view: ['owner', 'admin', 'agent', 'viewer'],
    create: ['owner', 'admin', 'agent'],
    edit: ['owner', 'admin', 'agent'],
    delete: ['owner', 'admin']
  },
  analytics: {
    view: ['owner', 'admin', 'agent'],
    export: ['owner', 'admin']
  },
  settings: {
    view: ['owner', 'admin'],
    edit: ['owner', 'admin']
  },
  users: {
    view: ['owner', 'admin'],
    create: ['owner', 'admin'],
    edit: ['owner', 'admin'],
    delete: ['owner']
  }
};

/**
 * Check if user has permission for a specific resource and action
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'User role not found'
        });
      }

      const allowedRoles = PERMISSIONS[resource]?.[action];
      
      if (!allowedRoles) {
        logger.warn('Permission check for unknown resource/action', {
          resource,
          action,
          userRole
        });
        return res.status(403).json({
          success: false,
          message: 'Permission not defined'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Permission denied', {
          resource,
          action,
          userRole,
          allowedRoles,
          userId: req.user.agentId
        });
        
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${allowedRoles.join(', ')}, Current: ${userRole}`
        });
      }

      // Add permission info to request for use in controllers
      req.permissions = {
        resource,
        action,
        userRole,
        allowedRoles
      };

      next();
    } catch (error) {
      logger.error('Permission check error', {
        error: error.message,
        resource,
        action,
        userId: req.user?.agentId
      });

      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check multiple permissions (user must have ALL)
 */
const checkMultiplePermissions = (permissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'User role not found'
        });
      }

      for (const { resource, action } of permissions) {
        const allowedRoles = PERMISSIONS[resource]?.[action];
        
        if (!allowedRoles || !allowedRoles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            message: `Insufficient permissions for ${resource}:${action}`
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Multiple permission check error', {
        error: error.message,
        permissions,
        userId: req.user?.agentId
      });

      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'User role not found'
        });
      }

      let hasPermission = false;
      
      for (const { resource, action } of permissions) {
        const allowedRoles = PERMISSIONS[resource]?.[action];
        
        if (allowedRoles && allowedRoles.includes(userRole)) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error('Any permission check error', {
        error: error.message,
        permissions,
        userId: req.user?.agentId
      });

      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Role-based middleware (simpler version)
 */
const requireRole = (requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error', {
        error: error.message,
        requiredRoles: roles,
        userId: req.user?.agentId
      });

      res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

/**
 * Get user permissions for frontend
 */
const getUserPermissions = (userRole) => {
  const permissions = {};
  
  for (const [resource, actions] of Object.entries(PERMISSIONS)) {
    permissions[resource] = {};
    
    for (const [action, allowedRoles] of Object.entries(actions)) {
      permissions[resource][action] = allowedRoles.includes(userRole);
    }
  }
  
  return permissions;
};

/**
 * Middleware to add user permissions to response
 */
const addPermissionsToResponse = (req, res, next) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole) {
      req.user.permissions = getUserPermissions(userRole);
    }
    
    next();
  } catch (error) {
    logger.error('Add permissions error', {
      error: error.message,
      userId: req.user?.agentId
    });
    
    // Don't fail the request, just continue without permissions
    next();
  }
};

module.exports = {
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission,
  requireRole,
  getUserPermissions,
  addPermissionsToResponse,
  PERMISSIONS
};