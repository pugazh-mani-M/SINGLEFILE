// backend/src/routes/whatsapp.routes.js
const express = require('express');
const whatsappController = require('../controllers/whatsapp.controller');
const {
  validatePhoneNumber,
  validateMessage,
  validateWhatsAppConfig,
  handleValidationErrors,
  sensitiveOperationLimit
} = require('../middleware/inputValidation');
const router = express.Router();

// Connect WhatsApp number (with validation and rate limiting)
router.post('/connect',
  sensitiveOperationLimit,
  validateWhatsAppConfig,
  handleValidationErrors,
  whatsappController.connect
);

// Test connection
router.post('/test',
  sensitiveOperationLimit,
  whatsappController.testConnection
);

// Get verification status
router.get('/verification-status', whatsappController.getVerificationStatus);

// Register webhook with Meta
router.post('/register-webhook',
  sensitiveOperationLimit,
  whatsappController.registerWebhook
);

// Disconnect (placeholder)
router.post('/disconnect', (req, res) => {
  res.json({ success: true, status: 'Disconnected' });
});

// Validate mobile number
router.post('/validate-number',
  validatePhoneNumber,
  handleValidationErrors,
  (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      const MobileValidator = require('../utils/mobileValidator');
      const validation = MobileValidator.validateAndFormat(phoneNumber);
      const whatsappCheck = MobileValidator.canReceiveWhatsApp(phoneNumber);
      
      res.json({
        isValid: validation.isValid,
        formatted: validation.formatted,
        country: validation.country,
        canReceiveWhatsApp: whatsappCheck.canReceive,
        error: validation.error || whatsappCheck.reason
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Check WhatsApp availability
router.post('/check-whatsapp',
  validatePhoneNumber,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const result = await whatsappController.checkWhatsAppNumber(phoneNumber);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Send message (with validation)
router.post('/send',
  validatePhoneNumber,
  validateMessage,
  handleValidationErrors,
  whatsappController.sendMessage
);

// Webhook routes
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.handleWebhook);

module.exports = router;