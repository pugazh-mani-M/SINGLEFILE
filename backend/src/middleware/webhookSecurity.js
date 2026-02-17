// Webhook security middleware for Meta verification
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Verify Meta webhook signature
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    console.error('❌ Missing webhook signature');
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;
  
  if (!appSecret) {
    console.error('❌ WHATSAPP_APP_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  try {
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(JSON.stringify(req.body), 'utf8')
      .digest('hex');
    
    const expectedHeader = `sha256=${expectedSignature}`;
    
    // Compare signatures using timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHeader))) {
      console.error('❌ Invalid webhook signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }
    
    console.log('✅ Webhook signature verified');
    next();
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return res.status(500).json({ error: 'Signature verification failed' });
  }
};

// Rate limiting for webhooks (Meta requirement)
const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per minute
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.error('❌ Webhook rate limit exceeded');
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});

// Validate webhook payload structure
const validateWebhookPayload = (req, res, next) => {
  const { body } = req;
  
  // Check for required Meta webhook structure
  if (!body.object || body.object !== 'whatsapp_business_account') {
    console.error('❌ Invalid webhook object type');
    return res.status(400).json({ error: 'Invalid webhook object' });
  }
  
  if (!body.entry || !Array.isArray(body.entry)) {
    console.error('❌ Missing or invalid entry array');
    return res.status(400).json({ error: 'Invalid webhook structure' });
  }
  
  console.log('✅ Webhook payload validated');
  next();
};

// Sanitize incoming message data
const sanitizeMessageData = (messageData) => {
  if (!messageData) return null;
  
  return {
    messageId: String(messageData.messageId || '').substring(0, 100),
    from: String(messageData.from || '').replace(/[^\d+]/g, '').substring(0, 20),
    text: String(messageData.text || '').substring(0, 4096), // WhatsApp max length
    type: String(messageData.type || 'text').substring(0, 20),
    timestamp: messageData.timestamp,
    contactName: String(messageData.contactName || '').substring(0, 100)
  };
};

// Log webhook activity for audit
const logWebhookActivity = (req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    signature: req.headers['x-hub-signature-256'] ? 'present' : 'missing',
    bodySize: JSON.stringify(req.body).length
  };
  
  console.log('📊 Webhook activity:', logEntry);
  next();
};

// Security headers for webhook responses
const setSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

module.exports = {
  verifyWebhookSignature,
  webhookRateLimiter,
  validateWebhookPayload,
  sanitizeMessageData,
  logWebhookActivity,
  setSecurityHeaders
};