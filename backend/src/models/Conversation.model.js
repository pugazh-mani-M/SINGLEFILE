const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
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
  
  // Customer Details
  customer: {
    phoneNumber: { type: String, required: true },
    name: String,
    profilePicture: String,
    lastSeen: Date
  },
  
  // 24-Hour Session Tracking (CRITICAL FOR META COMPLIANCE)
  session: {
    isOpen: { type: Boolean, default: false },
    lastCustomerMessageAt: Date,
    expiresAt: Date, // 24 hours from last customer message
    canSendFreeform: { type: Boolean, default: false }
  },
  
  // Assignment & Status
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Conversation Metadata
  tags: [String],
  notes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    isPrivate: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // AI & Automation
  ai: {
    isEnabled: { type: Boolean, default: false },
    lastBotResponse: Date,
    handoverRequested: { type: Boolean, default: false },
    handoverReason: String
  },
  
  // Opt-in Tracking (LEGAL REQUIREMENT)
  optIn: {
    hasOptedIn: { type: Boolean, default: false },
    optInSource: String, // 'website', 'qr_code', 'manual', etc.
    optInDate: Date,
    ipAddress: String
  },
  
  // Metrics
  metrics: {
    messageCount: { type: Number, default: 0 },
    firstResponseTime: Number, // seconds
    avgResponseTime: Number,   // seconds
    resolutionTime: Number     // seconds
  },
  
  // Timestamps
  lastMessageAt: Date,
  lastAgentMessageAt: Date,
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
conversationSchema.index({ businessId: 1, status: 1 });
conversationSchema.index({ businessId: 1, assignedTo: 1 });
conversationSchema.index({ 'customer.phoneNumber': 1, whatsappNumberId: 1 });
conversationSchema.index({ 'session.expiresAt': 1 });

// Update session status based on last customer message
conversationSchema.methods.updateSession = function() {
  if (this.session.lastCustomerMessageAt) {
    const now = new Date();
    const expiresAt = new Date(this.session.lastCustomerMessageAt.getTime() + 24 * 60 * 60 * 1000);
    
    this.session.expiresAt = expiresAt;
    this.session.isOpen = now < expiresAt;
    this.session.canSendFreeform = this.session.isOpen;
  }
};

// Pre-save middleware to update session
conversationSchema.pre('save', function(next) {
  this.updateSession();
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);