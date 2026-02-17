// backend/src/controllers/whatsapp.controller.js
const whatsappService = require('../services/whatsapp.service');
const whatsappCloudService = require('../services/whatsappCloudService');
const { Message, Conversation } = require('../models');

class WhatsAppController {
  // Connect WhatsApp number
  async connect(req, res) {
    try {
      const { accessToken, phoneNumberId, appSecret, webhookToken } = req.body;
      
      const result = await whatsappService.connectNumber({
        accessToken,
        phoneNumberId,
        appSecret,
        webhookToken
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Test connection
  async testConnection(req, res) {
    try {
      const phoneInfo = await whatsappCloudService.getPhoneNumberInfo();
      res.json({ success: !!phoneInfo, phoneInfo });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Webhook verification (GET)
  async verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  // Handle incoming messages (POST)
  async handleWebhook(req, res) {
    try {
      // Verify webhook signature for security
      const signature = req.headers['x-hub-signature-256'];
      if (signature && process.env.META_APP_SECRET) {
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', process.env.META_APP_SECRET)
          .update(JSON.stringify(req.body), 'utf8')
          .digest('hex');
        
        if (`sha256=${expectedSignature}` !== signature) {
          console.error('❌ Invalid webhook signature');
          return res.status(403).send('Forbidden');
        }
      }
      
      console.log('\n📨 INCOMING WEBHOOK MESSAGE!');
      console.log('🕰️ Timestamp:', new Date().toLocaleString());
      console.log('📝 Raw Data:', JSON.stringify(req.body, null, 2));
      
      const messageData = whatsappService.handleWebhook(req.body);
      
      if (messageData) {
        console.log('✅ MESSAGE RECEIVED SUCCESSFULLY!');
        console.log('📱 From:', messageData.from);
        console.log('💬 Message:', messageData.text);
        console.log('👤 Contact:', messageData.contactName || 'Unknown');
        console.log('🆔 Message ID:', messageData.messageId);
        console.log('🟢 Status: TEST MESSAGE RECEIVED - WhatsApp Integration Working!');
        
        // Store message in database
        await this.storeIncomingMessage(messageData);
      } else {
        console.log('⚠️ No message data extracted from webhook');
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).send('Error');
    }
  }
  
  // Store incoming message in database
  async storeIncomingMessage(messageData) {
    try {
      const { Message, Conversation } = require('../models');
      
      // Find or create conversation
      let conversation = await Conversation.findOne({ phoneNumber: messageData.from });
      if (!conversation) {
        conversation = new Conversation({
          phoneNumber: messageData.from,
          contactName: messageData.contactName || 'Unknown',
          status: 'active',
          lastMessageAt: new Date()
        });
        await conversation.save();
      }
      
      // Store message
      const message = new Message({
        conversationId: conversation._id,
        messageId: messageData.messageId,
        from: messageData.from,
        text: messageData.text,
        type: 'incoming',
        timestamp: new Date(messageData.timestamp * 1000)
      });
      
      await message.save();
      
      // Update conversation
      conversation.lastMessageAt = new Date();
      await conversation.save();
      
      console.log('💾 Message stored in database');
    } catch (error) {
      console.error('❌ Database storage error:', error);
    }
  }

  // Send message
  async sendMessage(req, res) {
    try {
      const { to, message, type = 'text' } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ error: 'Missing required fields: to, message' });
      }
      
      console.log(`📤 Sending message to ${to}: ${message}`);
      
      let result;
      if (type === 'template') {
        const { templateName, languageCode, components } = message;
        result = await whatsappCloudService.sendTemplate(to, templateName, languageCode, components);
      } else {
        // Fix: Extract text properly
        const textMessage = typeof message === 'string' ? message : (message.text || message.body || 'Empty message');
        result = await whatsappCloudService.sendText(to, textMessage);
      }

      console.log('✅ WhatsApp API response:', result);

      res.json({ 
        success: true, 
        messageId: result.messages[0].id,
        message: 'Message sent successfully'
      });
    } catch (error) {
      console.error('❌ Send message error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error.response?.data || error.message 
      });
    }
  }

  // Get verification status
  async getVerificationStatus(req, res) {
    try {
      console.log('🔍 Checking verification status...');
      
      const hasRealTokens = process.env.WHATSAPP_ACCESS_TOKEN && 
                           !process.env.WHATSAPP_ACCESS_TOKEN.includes('your-') &&
                           !process.env.WHATSAPP_ACCESS_TOKEN.includes('PASTE_');
      
      if (!hasRealTokens) {
        return res.json({
          meta_verification_status: 'pending',
          webhook_verified: false,
          whatsapp_number_status: 'pending',
          can_send_messages: false,
          phone_number: 'Not configured',
          business_account_id: 'Not configured',
          last_message_received_at: null,
          blocking_issues: ['Missing real WhatsApp access tokens'],
          non_blocking_issues: ['Configure Meta Developer Console tokens']
        });
      }
      
      let phoneInfo = null;
      let businessInfo = null;
      
      try {
        phoneInfo = await whatsappCloudService.getPhoneNumberInfo();
      } catch (error) {
        console.log('⚠️ Phone info error (expected with invalid tokens):', error.message);
      }
      
      try {
        businessInfo = await whatsappCloudService.getBusinessVerificationStatus();
      } catch (error) {
        console.log('⚠️ Business info error (expected with invalid tokens):', error.message);
      }
      
      const isProduction = process.env.NODE_ENV === 'production';
      
      let metaStatus = 'pending';
      if (isProduction && hasRealTokens && businessInfo) {
        metaStatus = businessInfo.account_review_status === 'APPROVED' ? 'verified' : 'pending';
      }
      
      const status = {
        meta_verification_status: metaStatus,
        webhook_verified: !!process.env.WEBHOOK_VERIFY_TOKEN && hasRealTokens,
        whatsapp_number_status: phoneInfo?.verified_name ? 'verified' : 'pending',
        can_send_messages: !!phoneInfo && hasRealTokens,
        phone_number: phoneInfo?.display_phone_number || 'Not configured',
        business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'Not configured',
        last_message_received_at: null,
        blocking_issues: this.getBlockingIssues(phoneInfo, hasRealTokens),
        non_blocking_issues: this.getNonBlockingIssues(metaStatus, phoneInfo)
      };

      res.json(status);
    } catch (error) {
      console.error('❌ Verification status error:', error);
      res.status(500).json({ 
        error: 'Failed to check verification status',
        details: error.message 
      });
    }
  }

  getBlockingIssues(phoneInfo, hasRealTokens) {
    const issues = [];
    if (!hasRealTokens) issues.push('Missing real WhatsApp access tokens');
    if (!phoneInfo) issues.push('WhatsApp number not configured');
    return issues;
  }

  getNonBlockingIssues(metaStatus, phoneInfo) {
    const issues = [];
    if (metaStatus === 'pending') issues.push('Meta business verification pending');
    if (!phoneInfo?.verified_name) issues.push('Phone number verification pending');
    return issues;
  }

  // Register webhook with Meta
  async registerWebhook(req, res) {
    try {
      const webhookUrl = process.env.WEBHOOK_URL || `${process.env.FRONTEND_URL}/api/whatsapp/webhook`;
      const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;
      
      const result = await whatsappCloudService.registerWebhook(webhookUrl, verifyToken);
      res.json({ success: true, webhook_url: webhookUrl, result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new WhatsAppController();