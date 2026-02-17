// Simple in-memory database for development
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class DevDatabaseService {
  constructor() {
    this.agents = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.contacts = new Map();
    this.initialized = false;
    
    // Initialize synchronously
    this.initializeDummyUserSync();
    console.log('✅ Development database initialized');
  }

  initializeDummyUserSync() {
    try {
      // Clear all existing users
      this.agents.clear();
      
      // Create new dummy user with pre-hashed password
      const passwordHash = bcrypt.hashSync('password123', 10);
      const dummyUser = {
        agentId: 'user-001',
        name: 'Demo User',
        email: 'demo@whatsapp.com',
        phone: null,
        passwordHash: passwordHash,
        role: 'admin',
        method: 'email',
        isActive: true,
        createdAt: new Date().toISOString(),
        consents: {
          necessary: true,
          analytics: false,
          marketing: false,
          whatsapp: false
        }
      };
      this.agents.set('user-001', dummyUser);
      this.initialized = true;
      console.log('👤 Demo user: demo@whatsapp.com / password123');
    } catch (error) {
      console.error('Error creating dummy user:', error);
    }
  }

  async getAgent(agentId) {
    try {
      return this.agents.get(agentId) || null;
    } catch (error) {
      console.error('Error getting agent:', error);
      return null;
    }
  }

  async getAgentByEmail(email) {
    try {
      if (!email) return null;
      for (const agent of this.agents.values()) {
        if (agent.email === email) return agent;
      }
      return null;
    } catch (error) {
      console.error('Error getting agent by email:', error);
      return null;
    }
  }

  async getAgentByPhone(phone) {
    try {
      if (!phone) return null;
      for (const agent of this.agents.values()) {
        if (agent.phone === phone) return agent;
      }
      return null;
    } catch (error) {
      console.error('Error getting agent by phone:', error);
      return null;
    }
  }

  async createAgent(agentData) {
    const agentId = uuidv4();
    const agent = {
      agentId,
      name: agentData.name,
      email: agentData.email || null,
      phone: agentData.phone || null,
      passwordHash: agentData.passwordHash || null,
      businessName: agentData.businessName || null,
      businessType: agentData.businessType || null,
      businessAddress: agentData.businessAddress || null,
      businessPhone: agentData.businessPhone || null,
      website: agentData.website || null,
      role: agentData.role || 'agent',
      method: agentData.method || 'email',
      isActive: true, 
      createdAt: new Date().toISOString(),
      consents: {
        necessary: true,
        analytics: false,
        marketing: false,
        whatsapp: false
      }
    };
    this.agents.set(agentId, agent);
    console.log(`👤 New user registered: ${agent.email} - ${agent.businessName}`);
    return agent;
  }

  async updateAgent(agentId, updates) {
    const agent = this.agents.get(agentId);
    if (agent) {
      Object.assign(agent, updates, { updatedAt: new Date().toISOString() });
      return agent;
    }
    return null;
  }

  async getAllConversations() {
    return Array.from(this.conversations.values());
  }

  async getConversationsByAgent(agentId) {
    return Array.from(this.conversations.values())
      .filter(conv => conv.assignedAgentId === agentId);
  }

  async createConversation(contactId, phoneNumber) {
    const conversationId = uuidv4();
    const conversation = {
      conversationId, contactId, phoneNumber,
      assignedAgentId: null, status: 'open', unreadCount: 0,
      lastCustomerMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  async updateConversation(conversationId, updates) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      Object.assign(conversation, updates, { updatedAt: new Date().toISOString() });
    }
  }

  async getConversationByPhone(phoneNumber) {
    for (const conv of this.conversations.values()) {
      if (conv.phoneNumber === phoneNumber) return conv;
    }
    return null;
  }

  async createMessage(conversationId, direction, type, content, phoneNumber, sender = null) {
    const messageId = uuidv4();
    const message = {
      messageId, conversationId, direction, type, content, phoneNumber,
      timestamp: new Date().toISOString(),
      sender
    };
    this.messages.set(messageId, message);
    return message;
  }

  async getMessagesByConversation(conversationId, limit = 50) {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  async createOrUpdateContact(phoneNumber, name) {
    const contactId = uuidv4();
    const contact = {
      contactId, phoneNumber, name: name || phoneNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.contacts.set(contactId, contact);
    return contact;
  }

  async getContactByPhone(phoneNumber) {
    for (const contact of this.contacts.values()) {
      if (contact.phoneNumber === phoneNumber) return contact;
    }
    return null;
  }

  // GDPR compliance methods
  async deleteAgent(agentId) {
    this.agents.delete(agentId);
    return true;
  }

  async deleteAgentConversations(agentId) {
    for (const [id, conv] of this.conversations.entries()) {
      if (conv.assignedAgentId === agentId) {
        this.conversations.delete(id);
      }
    }
    return true;
  }

  async updateAgentConsent(agentId, consents) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.consents = consents;
      agent.updatedAt = new Date().toISOString();
    }
    return agent;
  }
}

module.exports = new DevDatabaseService();