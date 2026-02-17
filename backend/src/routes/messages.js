const express = require('express');
const { auth } = require('../middleware/auth');
const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');
const whatsappCloudService = require('../services/whatsappCloudService');
const router = express.Router();

// Simple send message endpoint for testing (no auth required)
router.post('/send-message', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }
    
    console.log(`📤 Sending test message to ${to}: ${message}`);
    
    const result = await whatsappCloudService.sendText(to, message);
    
    res.json({
      success: true,
      messageId: result.messages[0].id,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.response?.data || error.message 
    });
  }
});

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { conversationId, message, type = 'text' } = req.body;
    
    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const phoneNumber = conversation.customer.phoneNumber;
    
    // Send via WhatsApp Cloud API
    let result;
    if (type === 'template') {
      const { templateName, languageCode, components } = message;
      result = await whatsappCloudService.sendTemplate(phoneNumber, templateName, languageCode, components);
    } else {
      const textMessage = typeof message === 'string' ? message : (message.text || message.body || 'Empty message');
      result = await whatsappCloudService.sendText(phoneNumber, textMessage);
    }
    
    // Save outbound message
    const messageData = {
      conversationId: conversation._id,
      businessId: conversation.businessId,
      whatsappNumberId: conversation.whatsappNumberId,
      direction: 'outbound',
      type: type,
      content: type === 'template' ? { text: `Template: ${message.templateName}` } : { text: message.text || message },
      sender: {
        userId: req.user?.id,
        type: 'agent',
        name: req.user?.name || 'Agent'
      },
      whatsapp: {
        messageId: result?.messages?.[0]?.id,
        status: 'sent',
        timestamp: new Date()
      },
      sessionCompliance: {
        wasWithinSession: conversation.session.isOpen,
        sessionExpiresAt: conversation.session.expiresAt,
        requiresTemplate: !conversation.session.isOpen
      },
      createdAt: new Date()
    };
    
    const newMessage = new Message(messageData);
    await newMessage.save();
    
    // Update conversation
    conversation.lastMessageAt = new Date();
    conversation.lastAgentMessageAt = new Date();
    await conversation.save();
    
    // Emit socket event
    if (global.io) {
      global.io.emit('message:sent', {
        message: newMessage,
        conversationId: conversation._id
      });
    }
    
    res.json({ 
      success: true, 
      messageId: result?.messages?.[0]?.id || newMessage._id,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ 
      conversationId: req.params.conversationId 
    })
    .sort({ createdAt: 1 })
    .limit(100);
    
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;