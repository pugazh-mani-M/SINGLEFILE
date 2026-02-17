const mongoose = require('mongoose');

const whatsAppNumberSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  
  // Meta WhatsApp Business API Details
  phoneNumberId: {
    type: String,
    required: true,
    unique: true
  },
  wabaId: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  displayPhoneNumber: String,
  verifiedName: String,
  
  // Status & Configuration
  status: {
    type: String,
    enum: ['pending', 'active', 'restricted', 'suspended'],
    default: 'pending'
  },
  isDefault: { type: Boolean, default: false },
  
  // Webhook Configuration
  webhook: {
    url: String,
    verifyToken: String, // Encrypted
    isActive: { type: Boolean, default: true }
  },
  
  // Usage & Limits
  usage: {
    currentMonth: {
      utility: { type: Number, default: 0 },
      marketing: { type: Number, default: 0 },
      authentication: { type: Number, default: 0 }
    },
    lastResetDate: { type: Date, default: Date.now }
  },
  
  // Assigned Agents
  assignedAgents: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Meta Integration Details
  meta: {
    accessToken: String, // Encrypted - System User Token
    appId: String,
    businessAccountId: String,
    lastSyncAt: Date
  },
  
  // Settings
  settings: {
    autoReply: {
      enabled: { type: Boolean, default: false },
      message: String,
      outsideBusinessHours: { type: Boolean, default: false }
    },
    aiBot: {
      enabled: { type: Boolean, default: false },
      handoverKeywords: [String],
      confidenceThreshold: { type: Number, default: 0.8 }
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
whatsAppNumberSchema.index({ businessId: 1 });
whatsAppNumberSchema.index({ phoneNumberId: 1 });
whatsAppNumberSchema.index({ businessId: 1, isDefault: 1 });

// Ensure only one default number per business
whatsAppNumberSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { businessId: this.businessId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('WhatsAppNumber', whatsAppNumberSchema);