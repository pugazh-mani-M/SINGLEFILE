const whatsappCloudService = require('../services/whatsappCloudService');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const mongoose = require('mongoose');

class WhatsAppWebhookController {
  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const result = await whatsappCloudService.verifyWebhook(mode, token, challenge);
      if (result) {
        console.log('Webhook verified successfully');
        return res.status(200).send(challenge);
      }
      
      return res.status(403).send('Forbidden');
    } catch (error) {
      console.error('Webhook verification error:', error);
      return res.status(500).send('Error');
    }
  }

  async handleWebhook(req, res) {
    try {
      const body = req.body;
      
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await this.processMessage(change.value);
            }
          }
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send('Error');
    }
  }

  async processMessage(value) {
    try {
      console.log('📨 Processing webhook message:', JSON.stringify(value, null, 2));
      
      if (!value.messages) {
        console.log('⚠️ No messages in webhook payload');
        return;
      }

      for (const message of value.messages) {
        console.log('📱 Processing message from:', message.from);
        
        const contact = value.contacts?.find(c => c.wa_id === message.from);
        const contactName = contact?.profile?.name || message.from;
        const phoneNumber = message.from;

        // Check verification status for test mode
        const isTestMode = process.env.NODE_ENV !== 'production' || 
                          !process.env.WHATSAPP_ACCESS_TOKEN || 
                          process.env.WHATSAPP_ACCESS_TOKEN.includes('your-');

        // Find or create conversation with minimal required fields
        let conversation = await Conversation.findOne({ 
          'customer.phoneNumber': phoneNumber 
        });

        if (!conversation) {
          console.log('🆕 Creating new conversation for:', phoneNumber);
          
          conversation = new Conversation({
            businessId: new mongoose.Types.ObjectId(), // Default business ID
            whatsappNumberId: new mongoose.Types.ObjectId(), // Default WhatsApp number ID
            customer: {
              phoneNumber: phoneNumber,
              name: contactName
            },
            status: 'open',
            session: {
              isOpen: true,
              lastCustomerMessageAt: new Date(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              canSendFreeform: true
            },
            optIn: {
              hasOptedIn: true,
              optInSource: 'whatsapp_webhook',
              optInDate: new Date()
            },
            lastMessageAt: new Date()
          });
          
          try {
            await conversation.save();
            console.log('✅ Conversation created:', conversation._id);
          } catch (saveError) {
            console.error('❌ Failed to save conversation:', saveError.message);
            continue;
          }
        } else {
          console.log('📝 Found existing conversation:', conversation._id);
        }

        // Create message with proper structure
        const messageData = {
          conversationId: conversation._id,
          businessId: conversation.businessId,
          whatsappNumberId: conversation.whatsappNumberId,
          direction: 'inbound',
          sender: {
            type: 'customer',
            name: contactName
          },
          whatsapp: {
            messageId: message.id,
            timestamp: new Date(parseInt(message.timestamp) * 1000),
            status: 'delivered'
          },
          sessionCompliance: {
            wasWithinSession: true,
            sessionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            requiresTemplate: false
          },
          createdAt: new Date()
        };

        // Handle different message types
        if (message.type === 'text') {
          messageData.type = 'text';
          messageData.content = { text: message.text.body };
        } else if (message.type === 'image') {
          messageData.type = 'image';
          messageData.content = {
            text: message.image.caption || '',
            media: {
              url: message.image.id,
              mimeType: message.image.mime_type,
              caption: message.image.caption
            }
          };
        } else if (message.type === 'document') {
          messageData.type = 'document';
          messageData.content = {
            text: message.document.filename || 'Document',
            media: {
              url: message.document.id,
              mimeType: message.document.mime_type,
              filename: message.document.filename
            }
          };
        } else if (message.type === 'interactive') {
          messageData.type = 'interactive';
          messageData.content = {
            text: message.interactive.button_reply?.title || 
                  message.interactive.list_reply?.title || 
                  'Interactive response'
          };
        } else {
          messageData.type = 'text';
          messageData.content = { text: `Unsupported message type: ${message.type}` };
        }

        // Save message
        try {
          const newMessage = new Message(messageData);
          await newMessage.save();
          console.log('✅ Message saved:', newMessage._id);

          // Update conversation
          conversation.lastMessageAt = messageData.createdAt;
          conversation.session.lastCustomerMessageAt = messageData.createdAt;
          conversation.session.isOpen = true;
          conversation.session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          conversation.metrics.messageCount += 1;
          
          await conversation.save();
          console.log('✅ Conversation updated');

          // Emit socket event for real-time updates
          if (global.io) {
            global.io.emit('message:new', {
              conversation: conversation,
              message: newMessage,
              contact: { name: contactName, phone: phoneNumber }
            });
            console.log('📡 Socket event emitted');
          }
        } catch (messageError) {
          console.error('❌ Failed to save message:', messageError.message);
        }
      }
    } catch (error) {
      console.error('❌ Message processing error:', error);
    }
  }
}

module.exports = new WhatsAppWebhookController();