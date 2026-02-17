const { body, validationResult } = require('express-validator');

const templateValidationRules = () => {
  return [
    body('name')
      .notEmpty()
      .withMessage('Template name is required')
      .isLength({ min: 1, max: 512 })
      .withMessage('Template name must be between 1 and 512 characters'),
    
    body('category')
      .isIn(['AUTHENTICATION', 'MARKETING', 'UTILITY'])
      .withMessage('Category must be AUTHENTICATION, MARKETING, or UTILITY'),
    
    body('language')
      .notEmpty()
      .withMessage('Language is required')
      .isLength({ min: 2, max: 10 })
      .withMessage('Language code must be between 2 and 10 characters'),
    
    body('components')
      .isArray({ min: 1 })
      .withMessage('Components array is required and must not be empty'),
    
    body('components.*.type')
      .isIn(['HEADER', 'BODY', 'FOOTER', 'BUTTONS'])
      .withMessage('Component type must be HEADER, BODY, FOOTER, or BUTTONS')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  templateValidationRules,
  validate
};