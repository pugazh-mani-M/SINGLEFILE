// backend/src/routes/webhook.routes.js
const express = require('express');
const whatsappController = require('../controllers/whatsapp.controller');
const router = express.Router();

// WhatsApp webhook verification and message handling
router.get('/whatsapp', whatsappController.verifyWebhook);
router.post('/whatsapp', whatsappController.handleWebhook);

module.exports = router;