const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}` +
    (info.splat !== undefined ? `${info.splat}` : " ") +
    (info.stack !== undefined ? `${info.stack}` : " ")
  )
);

const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: logFormat
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileLogFormat,
  transports,
  exitOnError: false
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.agentId
      });
    } else {
      logger.http(message, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.agentId
      });
    }
  });
  
  next();
};

// Template-specific logging methods
logger.template = {
  created: (templateId, templateName, userId) => {
    logger.info('Template created', {
      templateId,
      templateName,
      userId,
      action: 'template_created'
    });
  },
  
  updated: (templateId, templateName, userId) => {
    logger.info('Template updated', {
      templateId,
      templateName,
      userId,
      action: 'template_updated'
    });
  },
  
  submitted: (templateId, templateName, userId) => {
    logger.info('Template submitted for approval', {
      templateId,
      templateName,
      userId,
      action: 'template_submitted'
    });
  },
  
  approved: (templateId, templateName) => {
    logger.info('Template approved by Meta', {
      templateId,
      templateName,
      action: 'template_approved'
    });
  },
  
  rejected: (templateId, templateName, reason) => {
    logger.warn('Template rejected by Meta', {
      templateId,
      templateName,
      reason,
      action: 'template_rejected'
    });
  },
  
  syncError: (templateId, error) => {
    logger.error('Template sync failed', {
      templateId,
      error: error.message,
      stack: error.stack,
      action: 'template_sync_error'
    });
  }
};

// WhatsApp-specific logging methods
logger.whatsapp = {
  messageSent: (messageId, templateName, recipientId) => {
    logger.info('WhatsApp message sent', {
      messageId,
      templateName,
      recipientId,
      action: 'message_sent'
    });
  },
  
  messageDelivered: (messageId) => {
    logger.info('WhatsApp message delivered', {
      messageId,
      action: 'message_delivered'
    });
  },
  
  messageRead: (messageId) => {
    logger.info('WhatsApp message read', {
      messageId,
      action: 'message_read'
    });
  },
  
  messageFailed: (messageId, error) => {
    logger.error('WhatsApp message failed', {
      messageId,
      error: error.message,
      action: 'message_failed'
    });
  },
  
  webhookReceived: (webhookType, data) => {
    logger.debug('WhatsApp webhook received', {
      webhookType,
      data,
      action: 'webhook_received'
    });
  }
};

// Security logging methods
logger.security = {
  authSuccess: (userId, ip) => {
    logger.info('Authentication successful', {
      userId,
      ip,
      action: 'auth_success'
    });
  },
  
  authFailed: (email, ip, reason) => {
    logger.warn('Authentication failed', {
      email,
      ip,
      reason,
      action: 'auth_failed'
    });
  },
  
  permissionDenied: (userId, resource, action) => {
    logger.warn('Permission denied', {
      userId,
      resource,
      action: action,
      event: 'permission_denied'
    });
  },
  
  suspiciousActivity: (userId, activity, details) => {
    logger.warn('Suspicious activity detected', {
      userId,
      activity,
      details,
      action: 'suspicious_activity'
    });
  }
};

// Performance logging methods
logger.performance = {
  slowQuery: (query, duration, params) => {
    logger.warn('Slow database query', {
      query,
      duration,
      params,
      action: 'slow_query'
    });
  },
  
  apiResponse: (endpoint, duration, statusCode) => {
    if (duration > 1000) { // Log slow API responses
      logger.warn('Slow API response', {
        endpoint,
        duration,
        statusCode,
        action: 'slow_api_response'
      });
    }
  }
};

module.exports = logger;