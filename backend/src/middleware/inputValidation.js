// Input validation and sanitization middleware
const { body, param, query, validationResult } = require('express-validator');

// Validate phone number format
const validatePhoneNumber = [
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('to')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format')
];

// Validate message content
const validateMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 4096 })
    .withMessage('Message must be 1-4096 characters')
    .escape(),
  body('type')
    .optional()
    .isIn(['text', 'template', 'image', 'document', 'video'])
    .withMessage('Invalid message type')
];

// Validate WhatsApp connection config
const validateWhatsAppConfig = [
  body('accessToken')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Invalid access token format'),
  body('phoneNumberId')
    .trim()
    .isLength({ min: 10, max: 20 })
    .matches(/^\d+$/)
    .withMessage('Invalid phone number ID'),
  body('appSecret')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Invalid app secret'),
  body('webhookToken')
    .optional()
    .trim()
    .isLength({ min: 8 })
    .withMessage('Webhook token must be at least 8 characters')
];

// Validate user registration
const validateRegistration = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format')
];

// Validate user login
const validateLogin = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .optional(),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format')
];

// Validate GDPR data deletion request
const validateDataDeletion = [
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number'),
  body('userId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body()
    .custom((value, { req }) => {
      if (!req.body.phoneNumber && !req.body.userId) {
        throw new Error('Either phoneNumber or userId is required');
      }
      return true;
    })
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.error('❌ Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Sanitize general text input
const sanitizeTextInput = (text, maxLength = 1000) => {
  if (!text) return '';
  return String(text)
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential XSS characters
};

// Validate and sanitize conversation ID
const validateConversationId = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid conversation ID')
];

// Rate limit validation for sensitive operations
const sensitiveOperationLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  validatePhoneNumber,
  validateMessage,
  validateWhatsAppConfig,
  validateRegistration,
  validateLogin,
  validateDataDeletion,
  validateConversationId,
  handleValidationErrors,
  sanitizeTextInput,
  sensitiveOperationLimit
};