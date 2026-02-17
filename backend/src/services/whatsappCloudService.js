const axios = require('axios');

class WhatsAppCloudService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.appId = process.env.META_APP_ID;
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          ...message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send error:', error.response?.data);
      throw error;
    }
  }

  async sendTemplate(to, templateName, languageCode = 'en_US', components = []) {
    return this.sendMessage(to, {
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components
      }
    });
  }

  async sendText(to, text) {
    return this.sendMessage(to, {
      type: 'text',
      text: { body: text }
    });
  }

  async getPhoneNumberInfo() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Phone number info error:', error.response?.data);
      return null;
    }
  }

  async verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  parseWebhookMessage(webhookData) {
    try {
      if (!webhookData.entry || !webhookData.entry[0]) return null;
      
      const entry = webhookData.entry[0];
      if (!entry.changes || !entry.changes[0]) return null;
      
      const change = entry.changes[0];
      if (change.field !== 'messages' || !change.value.messages) return null;
      
      const message = change.value.messages[0];
      const contact = change.value.contacts ? change.value.contacts[0] : null;
      
      return {
        messageId: message.id,
        phoneNumber: message.from,
        text: message.text ? message.text.body : 'Non-text message',
        contactName: contact ? contact.profile.name : message.from,
        timestamp: new Date(parseInt(message.timestamp) * 1000)
      };
    } catch (error) {
      console.error('Error parsing webhook message:', error);
      return null;
    }
  }

  async getBusinessVerificationStatus() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Business verification status error:', error.response?.data);
      return null;
    }
  }

  async registerWebhook(webhookUrl, verifyToken) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.appId}/subscriptions`,
        {
          object: 'whatsapp_business_account',
          callback_url: webhookUrl,
          verify_token: verifyToken,
          fields: 'messages'
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Webhook registration error:', error.response?.data);
      throw error;
    }
  }
}

module.exports = new WhatsAppCloudService();