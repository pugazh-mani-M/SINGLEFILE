const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.PHONE_NUMBER_ID,
      businessAccountId: process.env.BUSINESS_ACCOUNT_ID
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  async testConnection() {
    try {
      console.log('Testing WhatsApp connection with config:', {
        hasToken: !!this.config.accessToken,
        hasPhoneId: !!this.config.phoneNumberId,
        tokenLength: this.config.accessToken?.length || 0
      });

      if (!this.config.accessToken || !this.config.phoneNumberId) {
        return {
          success: false,
          error: 'Missing access token or phone number ID. Please configure your WhatsApp Business API credentials.',
          configured: false,
          instructions: {
            step1: 'Go to https://developers.facebook.com/',
            step2: 'Create a WhatsApp Business App',
            step3: 'Get your Access Token and Phone Number ID',
            step4: 'Enter them in the configuration above'
          }
        };
      }

      const response = await axios.get(
        `${this.baseURL}/${this.config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      console.log('WhatsApp API Response:', response.data);

      return {
        success: true,
        message: 'WhatsApp API connection successful',
        configured: true,
        phoneNumber: response.data.display_phone_number,
        status: response.data.status,
        verifiedName: response.data.verified_name
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        errorCode: error.response?.data?.error?.code,
        configured: true,
        troubleshooting: {
          common_issues: [
            'Invalid access token - check if token is expired',
            'Wrong phone number ID - verify from Meta Business Manager',
            'App not approved for WhatsApp Business API',
            'Phone number not verified in Meta Business Manager'
          ]
        }
      };
    }
  }

  async sendTextMessage(to, message) {
    try {
      if (!this.config.accessToken || !this.config.phoneNumberId) {
        throw new Error('WhatsApp API not configured. Please save your configuration first.');
      }

      // Clean phone number format
      const cleanPhone = to.replace(/[^+\d]/g, '');
      if (!cleanPhone.startsWith('+')) {
        throw new Error('Phone number must start with + and country code (e.g., +1234567890)');
      }

      console.log('Sending WhatsApp message:', {
        to: cleanPhone,
        message: message.substring(0, 50) + '...',
        phoneNumberId: this.config.phoneNumberId
      });

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: {
          body: message
        }
      };

      console.log('WhatsApp API Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.baseURL}/${this.config.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp API Success Response:', response.data);

      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: 'sent',
        to: cleanPhone,
        message: message,
        whatsappResponse: response.data,
        deliveryNote: 'Message sent to WhatsApp. Check if recipient phone is added as test number in Meta Business Manager.',
        troubleshooting: {
          step1: 'Verify phone number is added in Meta Business Manager',
          step2: 'Check if WhatsApp is installed on recipient phone',
          step3: 'Ensure phone number format is correct (+countrycode+number)',
          step4: 'Test with Meta\'s Send Message tool first'
        }
      };
    } catch (error) {
      console.error('WhatsApp Send Error:', error.response?.data || error.message);
      
      const errorDetails = {
        message: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code,
        type: error.response?.data?.error?.type,
        details: error.response?.data?.error
      };

      console.log('Detailed Error:', errorDetails);
      
      throw new Error(`WhatsApp API Error: ${errorDetails.message} (Code: ${errorDetails.code})`);
    }
  }

  async checkRecipientStatus(phoneNumber) {
    try {
      if (!this.config.accessToken || !this.config.phoneNumberId) {
        throw new Error('WhatsApp API not configured');
      }

      // This is a workaround since Meta doesn't provide direct recipient verification
      // We'll send a template message first to check if recipient is valid
      const response = await axios.post(
        `${this.baseURL}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'hello_world',
            language: {
              code: 'en_US'
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Recipient is valid and can receive messages',
        messageId: response.data.messages[0].id
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code
      };
    }
  }

  async sendTemplateMessage(to, templateName, languageCode = 'en_US') {
    try {
      if (!this.config.accessToken || !this.config.phoneNumberId) {
        throw new Error('WhatsApp API not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: 'sent',
        to: to,
        templateName: templateName
      };
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}

module.exports = new WhatsAppService();