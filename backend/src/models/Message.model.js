const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  whatsappNumberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppNumber',
    required: true
  },
  
  // Message Direction & Type
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video', 'template', 'interactive'],
    required: true
  },
  
  // Message Content
  content: {
    text: String,
    media: {
      url: String,
      mimeType: String,
      filename: String,
      caption: String
    },
    template: {
      name: String,
      language: String,
      parameters: [mongoose.Schema.Types.Mixed]
    },
    interactive: {
      type: String, // 'button', 'list'
      body: String,
      buttons: [{
        id: String,
        title: String
      }],
      list: {
        sections: [{
          title: String,
          rows: [{
            id: String,
            title: String,
            description: String
          }]
        }]
      }
    }
  },
  
  // WhatsApp Message Details
  whatsapp: {
    messageId: String, // WhatsApp message ID
    wabaMessageId: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    timestamp: Date,
    error: {
      code: Number,
      message: String
    }
  },
  
  // Sender Information
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['customer', 'agent', 'system', 'ai_bot'],
      required: true
    },
    name: String
  },
  
  // Session Compliance (CRITICAL)
  sessionCompliance: {
    wasWithinSession: { type: Boolean, required: true },
    sessionExpiresAt: Date,
    requiresTemplate: { type: Boolean, default: false },
    templateUsed: String
  },
  
  // AI & Automation
  ai: {
    isGenerated: { type: Boolean, default: false },
    confidence: Number,
    intent: String,
    entities: [mongoose.Schema.Types.Mixed]
  },
  
  // Billing Category (for Meta billing)
  billingCategory: {
    type: String,
    enum: ['utility', 'marketing', 'authentication'],
    default: 'utility'
  },
  
  // Message Metadata
  metadata: {
    isPrivateNote: { type: Boolean, default: false },
    isAutoReply: { type: Boolean, default: false },
    replyToMessageId: String,
    forwardedFrom: String
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ businessId: 1, createdAt: -1 });
messageSchema.index({ whatsappNumberId: 1, direction: 1 });
messageSchema.index({ 'whatsapp.messageId': 1 });

// Update conversation metrics on message save
messageSchema.post('save', async function() {
  const Conversation = mongoose.model('Conversation');
  
  await Conversation.findByIdAndUpdate(this.conversationId, {
    lastMessageAt: this.createdAt,
    ...(this.direction === 'outbound' && this.sender.type === 'agent' && {
      lastAgentMessageAt: this.createdAt
    }),
    $inc: { 'metrics.messageCount': 1 }
  });
  
  // Update session if customer message
  if (this.direction === 'inbound' && this.sender.type === 'customer') {
    await Conversation.findByIdAndUpdate(this.conversationId, {
      'session.lastCustomerMessageAt': this.createdAt,
      'session.isOpen': true,
      'session.canSendFreeform': true,
      'session.expiresAt': new Date(this.createdAt.getTime() + 24 * 60 * 60 * 1000)
    });
  }
});

module.exports = mongoose.model('Message', messageSchema);