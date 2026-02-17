// backend/src/services/whatsapp.service.js
const axios = require('axios');
const MobileValidator = require('../utils/mobileValidator');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}`;
  }

  // Connect and verify WhatsApp number
  async connectNumber(config) {
    try {
      // Validate required fields
      if (!config.accessToken || !config.phoneNumberId) {
        throw new Error('Missing required fields: accessToken and phoneNumberId');
      }
      
      console.log('🔗 Attempting WhatsApp connection...');
      console.log('📱 Phone Number ID:', config.phoneNumberId);
      console.log('🔑 Access Token:', config.accessToken.substring(0, 10) + '...');
      
      // Use the provided config instead of environment variables
      const apiUrl = `https://graph.facebook.com/v18.0/${config.phoneNumberId}`;
      
      // Test connection with a simple API call
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });
      
      console.log('✅ WhatsApp Connection SUCCESS!');
      console.log('📞 Phone Number:', response.data.display_phone_number);
      console.log('🟢 Status: CONNECTED - Ready to receive test messages');
      
      return {
        success: true,
        phoneNumber: response.data.display_phone_number,
        status: 'Connected',
        verified: response.data.verified_name || false
      };
    } catch (error) {
      console.error('❌ WhatsApp Connection FAILED!');
      console.error('🔴 Error:', error.response?.data?.error?.message || error.message);
      console.error('💡 Tip: Check your Access Token and Phone Number ID');
      throw new Error('Failed to connect WhatsApp number: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  // Send message to a number with validation
  async sendMessage(to, message) {
    try {
      // Validate mobile number
      const validation = MobileValidator.validateAndFormat(to);
      if (!validation.isValid) {
        throw new Error(`Invalid phone number: ${validation.error}`);
      }
      
      const whatsappCheck = MobileValidator.canReceiveWhatsApp(to);
      if (!whatsappCheck.canReceive) {
        throw new Error(`Number cannot receive WhatsApp messages: ${whatsappCheck.reason}`);
      }
      
      console.log('📱 Sending to validated number:', whatsappCheck.formatted);
      
      const response = await axios.post(`${this.apiUrl}/messages`, {
        messaging_product: 'whatsapp',
        to: whatsappCheck.formatted,
        type: 'text',
        text: { body: message }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        ...response.data,
        formattedNumber: whatsappCheck.formatted,
        country: whatsappCheck.country
      };
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message);
      throw new Error('Failed to send message: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  // Handle incoming webhook messages
  handleWebhook(body) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (value?.messages) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];
        
        // Validate incoming number
        const validation = MobileValidator.validateAndFormat(message.from);
        
        return {
          messageId: message.id,
          from: validation.isValid ? validation.formatted : message.from,
          originalFrom: message.from,
          text: message.text?.body || message.interactive?.button_reply?.title || 'Media message',
          type: message.type,
          timestamp: message.timestamp,
          contactName: contact?.profile?.name,
          country: validation.isValid ? validation.country : null,
          isValidNumber: validation.isValid
        };
      }
      
      // Handle status updates
      if (value?.statuses) {
        const status = value.statuses[0];
        return {
          type: 'status',
          messageId: status.id,
          status: status.status,
          timestamp: status.timestamp,
          recipientId: status.recipient_id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Webhook parsing error:', error);
      return null;
    }
  }
  
  // Check if number is on WhatsApp
  async checkWhatsAppNumber(phoneNumber) {
    try {
      const validation = MobileValidator.validateAndFormat(phoneNumber);
      if (!validation.isValid) {
        return { exists: false, error: validation.error };
      }
      
      // This would require WhatsApp Business API premium features
      // For now, we assume valid numbers can receive messages
      const whatsappCheck = MobileValidator.canReceiveWhatsApp(phoneNumber);
      
      return {
        exists: whatsappCheck.canReceive,
        formatted: whatsappCheck.formatted,
        country: whatsappCheck.country
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}

module.exports = new WhatsAppService();