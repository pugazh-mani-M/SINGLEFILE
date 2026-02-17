const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/whatsappWebhook.controller');

// Webhook verification (GET)
router.get('/webhook', webhookController.verifyWebhook);

// Webhook events (POST)
router.post('/webhook', webhookController.handleWebhook);

module.exports = router;