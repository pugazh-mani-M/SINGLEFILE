const WhatsAppNumber = require('../models/WhatsAppNumber.model');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const OptIn = require('../models/OptIn.model');
const whatsappService = require('../services/whatsapp.service');
const sessionService = require('../services/session.service');
const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

class WebhookController {
  /**
   * Verify webhook (GET request from Meta)
   */
  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        logger.info('Webhook verified successfully');
        return res.status(200).send(challenge);
      }

      logger.warn('Webhook verification failed', { mode, token });
      return res.status(403).send('Forbidden');
    } catch (error) {
      logger.error('Webhook verification error', { error: error.message });
      return res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Handle incoming webhook (POST request from Meta)
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-hub-signature-256'];
      const payload = JSON.stringify(req.body);

      // Verify webhook signature (SECURITY CRITICAL)
      if (!whatsappService.verifyWebhookSignature(payload, signature)) {
        logger.warn('Invalid webhook signature');
        return res.status(401).send('Unauthorized');
      }

      // Process webhook asynchronously
      this.processWebhookAsync(req.body);

      // Respond immediately to Meta
      return res.status(200).send('OK');
    } catch (error) {
      logger.error('Webhook handling error', { error: error.message });
      return res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Process webhook data asynchronously
   */
  async processWebhookAsync(body) {
    try {
      const events = await whatsappService.processWebhook(body);
      if (!events) return;

      for (const event of events) {
        if (event.type === 'message') {
          await this.handleIncomingMessage(event);
        } else if (event.type === 'status') {
          await this.handleMessageStatus(event);
        }
      }
    } catch (error) {
      logger.error('Async webhook processing error', { error: error.message });
    }
  }

  /**
   * Handle incoming message
   */
  async handleIncomingMessage(event) {
    try {
      // Find WhatsApp number
      const whatsappNumber = await WhatsAppNumber.findOne({
        phoneNumberId: event.phoneNumberId
      }).populate('businessId');

      if (!whatsappNumber) {
        logger.warn('WhatsApp number not found', { phoneNumberId: event.phoneNumberId });
        return;
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        businessId: whatsappNumber.businessId._id,
        whatsappNumberId: whatsappNumber._id,
        'customer.phoneNumber': event.from
      });

      if (!conversation) {
        conversation = await this.createNewConversation(
          whatsappNumber,
          event.from,
          event.contact
        );
      }

      // Check opt-in status (LEGAL REQUIREMENT)
      const optInStatus = await this.checkOptInStatus(
        whatsappNumber.businessId._id,
        whatsappNumber._id,
        event.from
      );

      if (!optInStatus.canReceive) {
        logger.warn('Message from non-opted-in customer', {
          phoneNumber: event.from,
          businessId: whatsappNumber.businessId._id
        });
        // Still save the message but mark as non-compliant
      }

      // Update session (CRITICAL FOR 24-HOUR RULE)
      await sessionService.updateSessionFromCustomerMessage(
        conversation._id,
        event.timestamp
      );

      // Save incoming message
      const message = await Message.create({
        conversationId: conversation._id,
        businessId: whatsappNumber.businessId._id,
        whatsappNumberId: whatsappNumber._id,
        direction: 'inbound',
        type: event.messageType,
        content: event.content,
        whatsapp: {
          messageId: event.messageId,
          timestamp: event.timestamp,
          status: 'delivered'
        },
        sender: {
          type: 'customer',
          name: event.contact?.name || event.from
        },
        sessionCompliance: {
          wasWithinSession: true, // Incoming messages always open session
          sessionExpiresAt: new Date(event.timestamp.getTime() + 24 * 60 * 60 * 1000),
          requiresTemplate: false
        },
        billingCategory: 'utility'
      });

      // Update conversation
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageAt: event.timestamp,
        status: 'open',
        'customer.name': event.contact?.name || conversation.customer.name,
        $inc: { 'metrics.messageCount': 1 }
      });

      // Emit real-time event
      req.app.get('io').to(`business:${whatsappNumber.businessId._id}`).emit('message:received', {
        conversationId: conversation._id,
        message: message.toObject(),
        sessionStatus: sessionService.getSessionStatus(conversation)
      });

      // Process AI response if enabled
      if (whatsappNumber.settings.aiBot.enabled && conversation.ai.isEnabled) {
        await this.processAIResponse(conversation, message, whatsappNumber);
      }

      logger.info('Incoming message processed', {
        conversationId: conversation._id,
        messageId: message._id,
        from: event.from
      });

    } catch (error) {
      logger.error('Failed to handle incoming message', {
        phoneNumberId: event.phoneNumberId,
        from: event.from,
        error: error.message
      });
    }
  }

  /**
   * Handle message status update
   */
  async handleMessageStatus(event) {
    try {
      await Message.findOneAndUpdate(
        { 'whatsapp.messageId': event.messageId },
        {
          'whatsapp.status': event.status,
          ...(event.error && { 'whatsapp.error': event.error })
        }
      );

      // Emit real-time status update
      req.app.get('io').emit('message:status', {
        messageId: event.messageId,
        status: event.status,
        error: event.error
      });

      logger.info('Message status updated', {
        messageId: event.messageId,
        status: event.status
      });

    } catch (error) {
      logger.error('Failed to handle message status', {
        messageId: event.messageId,
        error: error.message
      });
    }
  }

  /**
   * Create new conversation
   */
  async createNewConversation(whatsappNumber, customerPhone, contact) {
    const conversation = await Conversation.create({
      businessId: whatsappNumber.businessId._id,
      whatsappNumberId: whatsappNumber._id,
      customer: {
        phoneNumber: customerPhone,
        name: contact?.name || customerPhone
      },
      session: {
        isOpen: true,
        lastCustomerMessageAt: new Date(),
        canSendFreeform: true
      },
      status: 'open',
      ai: {
        isEnabled: whatsappNumber.settings.aiBot.enabled
      }
    });

    // Auto-assign to agent if enabled
    if (whatsappNumber.businessId.settings.autoAssignment) {
      await this.autoAssignConversation(conversation, whatsappNumber);
    }

    return conversation;
  }

  /**
   * Auto-assign conversation to available agent
   */
  async autoAssignConversation(conversation, whatsappNumber) {
    try {
      const User = require('../models/User.model');
      
      // Find available agents assigned to this WhatsApp number
      const availableAgents = await User.find({
        businessId: whatsappNumber.businessId._id,
        assignedNumbers: whatsappNumber._id,
        status: 'active',
        role: { $in: ['agent', 'admin'] }
      }).sort({ lastActiveAt: -1 });

      if (availableAgents.length > 0) {
        // Simple round-robin assignment
        // In production, use more sophisticated logic
        const assignedAgent = availableAgents[0];
        
        await Conversation.findByIdAndUpdate(conversation._id, {
          assignedTo: assignedAgent._id
        });

        logger.info('Conversation auto-assigned', {
          conversationId: conversation._id,
          assignedTo: assignedAgent._id
        });
      }
    } catch (error) {
      logger.error('Failed to auto-assign conversation', {
        conversationId: conversation._id,
        error: error.message
      });
    }
  }

  /**
   * Check customer opt-in status
   */
  async checkOptInStatus(businessId, whatsappNumberId, phoneNumber) {
    try {
      const optIn = await OptIn.findOne({
        businessId,
        whatsappNumberId,
        'customer.phoneNumber': phoneNumber
      });

      if (!optIn) {
        // Create implicit opt-in for customer-initiated conversation
        await OptIn.create({
          businessId,
          whatsappNumberId,
          customer: { phoneNumber },
          optIn: {
            status: 'opted_in',
            source: 'whatsapp_initiated',
            method: 'whatsapp_message',
            timestamp: new Date()
          },
          consent: {
            utilityMessages: true,
            dataProcessing: true
          }
        });

        return { canReceive: true, isImplicit: true };
      }

      return {
        canReceive: optIn.canReceiveUtility(),
        canReceiveMarketing: optIn.canReceiveMarketing(),
        optInDate: optIn.optIn.timestamp
      };
    } catch (error) {
      logger.error('Failed to check opt-in status', {
        businessId,
        phoneNumber,
        error: error.message
      });
      return { canReceive: false };
    }
  }

  /**
   * Process AI response
   */
  async processAIResponse(conversation, incomingMessage, whatsappNumber) {
    try {
      // Only respond if session is open
      if (!sessionService.isSessionOpen(conversation)) {
        return;
      }

      const aiResponse = await aiService.generateResponse(
        incomingMessage.content.text,
        conversation,
        whatsappNumber.businessId
      );

      if (aiResponse.shouldRespond && aiResponse.confidence >= whatsappNumber.settings.aiBot.confidenceThreshold) {
        // Send AI response
        const accessToken = whatsappNumber.meta.accessToken; // Decrypt in production
        
        await whatsappService.sendTextMessage(
          whatsappNumber.phoneNumberId,
          conversation.customer.phoneNumber,
          aiResponse.message,
          accessToken
        );

        // Save AI message
        await Message.create({
          conversationId: conversation._id,
          businessId: whatsappNumber.businessId._id,
          whatsappNumberId: whatsappNumber._id,
          direction: 'outbound',
          type: 'text',
          content: { text: aiResponse.message },
          sender: {
            type: 'ai_bot',
            name: 'AI Assistant'
          },
          sessionCompliance: {
            wasWithinSession: true,
            requiresTemplate: false
          },
          ai: {
            isGenerated: true,
            confidence: aiResponse.confidence,
            intent: aiResponse.intent
          },
          billingCategory: 'utility'
        });

        logger.info('AI response sent', {
          conversationId: conversation._id,
          confidence: aiResponse.confidence
        });
      }
    } catch (error) {
      logger.error('Failed to process AI response', {
        conversationId: conversation._id,
        error: error.message
      });
    }
  }
}

module.exports = new WebhookController();