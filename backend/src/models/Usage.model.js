const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
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
  
  // Billing Period
  period: {
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  
  // Message Usage by Category (Meta Billing Categories)
  messages: {
    utility: {
      count: { type: Number, default: 0 },
      cost: { type: Number, default: 0 }, // in cents
      details: [{
        date: Date,
        count: Number,
        templateName: String,
        conversationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Conversation'
        }
      }]
    },
    marketing: {
      count: { type: Number, default: 0 },
      cost: { type: Number, default: 0 },
      details: [{
        date: Date,
        count: Number,
        templateName: String,
        conversationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Conversation'
        }
      }]
    },
    authentication: {
      count: { type: Number, default: 0 },
      cost: { type: Number, default: 0 },
      details: [{
        date: Date,
        count: Number,
        templateName: String,
        conversationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Conversation'
        }
      }]
    }
  },
  
  // Conversation Metrics
  conversations: {
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    avgDuration: { type: Number, default: 0 }, // in minutes
    avgResponseTime: { type: Number, default: 0 } // in seconds
  },
  
  // Agent Activity
  agents: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    messagesSent: { type: Number, default: 0 },
    conversationsHandled: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    activeHours: { type: Number, default: 0 }
  }],
  
  // Template Usage
  templates: [{
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template'
    },
    name: String,
    category: String,
    usage: { type: Number, default: 0 },
    deliveryRate: { type: Number, default: 0 },
    readRate: { type: Number, default: 0 }
  }],
  
  // API Usage
  api: {
    requests: { type: Number, default: 0 },
    webhooks: { type: Number, default: 0 },
    errors: { type: Number, default: 0 }
  },
  
  // Billing Summary
  billing: {
    totalCost: { type: Number, default: 0 }, // in cents
    currency: { type: String, default: 'USD' },
    planLimits: {
      conversations: Number,
      messages: Number,
      agents: Number
    },
    overages: {
      conversations: { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
      cost: { type: Number, default: 0 }
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'finalized', 'billed'],
    default: 'active'
  },
  finalizedAt: Date,
  billedAt: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
usageSchema.index({ businessId: 1, 'period.year': 1, 'period.month': 1 });
usageSchema.index({ whatsappNumberId: 1, 'period.year': 1, 'period.month': 1 });
usageSchema.index({ businessId: 1, status: 1 });

// Static method to get or create current month usage
usageSchema.statics.getCurrentMonthUsage = async function(businessId, whatsappNumberId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  let usage = await this.findOne({
    businessId,
    whatsappNumberId,
    'period.year': year,
    'period.month': month
  });
  
  if (!usage) {
    usage = await this.create({
      businessId,
      whatsappNumberId,
      period: { year, month, startDate, endDate }
    });
  }
  
  return usage;
};

// Method to increment message usage
usageSchema.methods.incrementMessage = function(category, templateName, conversationId, cost = 0) {
  if (!this.messages[category]) return;
  
  this.messages[category].count += 1;
  this.messages[category].cost += cost;
  this.messages[category].details.push({
    date: new Date(),
    count: 1,
    templateName,
    conversationId
  });
  
  this.billing.totalCost += cost;
  this.updatedAt = new Date();
};

// Method to check if limits are exceeded
usageSchema.methods.checkLimits = function() {
  const limits = this.billing.planLimits;
  const overages = {
    conversations: Math.max(0, this.conversations.total - (limits.conversations || Infinity)),
    messages: Math.max(0, 
      this.messages.utility.count + 
      this.messages.marketing.count + 
      this.messages.authentication.count - 
      (limits.messages || Infinity)
    )
  };
  
  this.billing.overages = overages;
  return overages.conversations > 0 || overages.messages > 0;
};

module.exports = mongoose.model('Usage', usageSchema);