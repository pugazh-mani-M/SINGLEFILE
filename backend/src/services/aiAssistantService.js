const axios = require('axios');

class AIAssistantService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.enabled = !!this.openaiApiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateResponse(message, context = {}) {
    if (!this.enabled) {
      return this.getFallbackResponse(message);
    }

    try {
      const prompt = this.buildPrompt(message, context);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful customer service assistant for a business. Keep responses short, friendly, and professional. Always try to help the customer.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI response error:', error.response?.data || error.message);
      return this.getFallbackResponse(message);
    }
  }

  buildPrompt(message, context) {
    const { customerName, phoneNumber, previousMessages } = context;
    
    let prompt = `Customer message: "${message}"`;
    
    if (customerName) {
      prompt += `\nCustomer name: ${customerName}`;
    }
    
    if (previousMessages && previousMessages.length > 0) {
      prompt += `\nRecent conversation context: ${previousMessages.slice(-3).map(m => m.content).join(' | ')}`;
    }
    
    return prompt;
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! Thanks for contacting us. How can I help you today?';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'I\'d be happy to help with pricing information. Let me connect you with our sales team who can provide detailed pricing.';
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return 'I\'m here to help! Can you please describe the issue you\'re experiencing?';
    }
    
    if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
      return 'Great! I can help you schedule a demo. What time works best for you?';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }
    
    // Default response
    return 'Thank you for your message! I\'ve received your inquiry and will make sure someone from our team gets back to you shortly.';
  }

  shouldAutoRespond(conversation, message) {
    // Auto-respond conditions
    const conditions = [
      // First message from customer
      !conversation.lastAgentMessageAt,
      
      // Outside business hours
      this.isOutsideBusinessHours(),
      
      // No agent response in 30 minutes
      this.isDelayedResponse(conversation.lastCustomerMessageAt, conversation.lastAgentMessageAt)
    ];
    
    return conditions.some(condition => condition);
  }

  isOutsideBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Business hours: Monday-Friday 9AM-6PM
    const isWeekend = day === 0 || day === 6;
    const isOutsideHours = hour < 9 || hour >= 18;
    
    return isWeekend || isOutsideHours;
  }

  isDelayedResponse(lastCustomerMessage, lastAgentMessage) {
    if (!lastCustomerMessage) return false;
    
    const now = new Date();
    const customerTime = new Date(lastCustomerMessage);
    const agentTime = lastAgentMessage ? new Date(lastAgentMessage) : null;
    
    // If agent responded after customer's last message, no auto-response needed
    if (agentTime && agentTime > customerTime) return false;
    
    // Auto-respond if no agent response in 30 minutes
    const minutesSinceCustomer = (now - customerTime) / (1000 * 60);
    return minutesSinceCustomer > 30;
  }
}

module.exports = new AIAssistantService();