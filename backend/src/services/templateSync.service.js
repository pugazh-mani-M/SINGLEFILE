const axios = require('axios');

class TemplateSyncService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  async createTemplate(templateData) {
    // Check if in development mode or missing credentials
    if (process.env.NODE_ENV === 'development' || !this.accessToken || !this.businessAccountId) {
      // Return mock response for development
      return {
        id: `mock_${Date.now()}`,
        status: 'PENDING'
      };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/${this.businessAccountId}/message_templates`,
        {
          name: templateData.name,
          category: templateData.category,
          language: templateData.language,
          components: templateData.components
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
      throw new Error(`Meta API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getTemplateStatus(templateId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Meta API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async deleteTemplate(templateId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Meta API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getAllTemplates() {
    // Check if in development mode or missing credentials
    if (process.env.NODE_ENV === 'development' || !this.accessToken || !this.businessAccountId) {
      // Return mock data for development
      return [
        {
          id: 'mock_template_1',
          name: 'welcome_message',
          status: 'APPROVED',
          category: 'UTILITY',
          language: 'en_US'
        },
        {
          id: 'mock_template_2', 
          name: 'order_confirmation',
          status: 'PENDING',
          category: 'UTILITY',
          language: 'en_US'
        }
      ];
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/${this.businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid WhatsApp API credentials');
      }
      throw new Error(`Meta API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = TemplateSyncService;