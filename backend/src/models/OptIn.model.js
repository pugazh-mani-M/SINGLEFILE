const mongoose = require('mongoose');

const optInSchema = new mongoose.Schema({
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
  
  // Customer Information
  customer: {
    phoneNumber: { type: String, required: true },
    name: String,
    email: String
  },
  
  // Opt-in Details (LEGAL REQUIREMENT)
  optIn: {
    status: {
      type: String,
      enum: ['opted_in', 'opted_out', 'pending'],
      default: 'pending'
    },
    source: {
      type: String,
      enum: ['website', 'qr_code', 'manual', 'whatsapp_initiated', 'api', 'import'],
      required: true
    },
    method: {
      type: String,
      enum: ['checkbox', 'button_click', 'verbal', 'sms', 'email', 'form_submission'],
      required: true
    },
    timestamp: { type: Date, required: true },
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  
  // Consent Details
  consent: {
    marketingMessages: { type: Boolean, default: false },
    utilityMessages: { type: Boolean, default: true },
    dataProcessing: { type: Boolean, required: true },
    thirdPartySharing: { type: Boolean, default: false },
    consentText: String, // The exact consent text shown to user
    consentVersion: String // Version of privacy policy/terms
  },
  
  // Opt-out Information
  optOut: {
    timestamp: Date,
    reason: String,
    method: {
      type: String,
      enum: ['whatsapp_stop', 'website', 'email', 'phone', 'manual']
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Audit Trail
  history: [{
    action: {
      type: String,
      enum: ['opted_in', 'opted_out', 'consent_updated', 'data_updated']
    },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String
  }],
  
  // Compliance Metadata
  compliance: {
    gdprCompliant: { type: Boolean, default: true },
    ccpaCompliant: { type: Boolean, default: true },
    dataRetentionDate: Date, // When to delete this record
    lastVerified: Date,
    verificationMethod: String
  },
  
  // Integration Data
  integration: {
    externalId: String, // ID from external system
    source: String,     // 'website', 'crm', 'api'
    metadata: mongoose.Schema.Types.Mixed
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance and compliance
optInSchema.index({ businessId: 1, 'customer.phoneNumber': 1 }, { unique: true });
optInSchema.index({ businessId: 1, 'optIn.status': 1 });
optInSchema.index({ 'compliance.dataRetentionDate': 1 });
optInSchema.index({ 'optIn.timestamp': 1 });

// Check if customer can receive marketing messages
optInSchema.methods.canReceiveMarketing = function() {
  return this.optIn.status === 'opted_in' && this.consent.marketingMessages;
};

// Check if customer can receive utility messages
optInSchema.methods.canReceiveUtility = function() {
  return this.optIn.status === 'opted_in' && this.consent.utilityMessages;
};

// Add to audit history
optInSchema.methods.addToHistory = function(action, details, performedBy, ipAddress) {
  this.history.push({
    action,
    details,
    performedBy,
    ipAddress,
    timestamp: new Date()
  });
};

// Pre-save middleware
optInSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set data retention date (2 years from opt-out or last activity)
  if (this.optIn.status === 'opted_out' && this.optOut.timestamp) {
    this.compliance.dataRetentionDate = new Date(
      this.optOut.timestamp.getTime() + (2 * 365 * 24 * 60 * 60 * 1000)
    );
  }
  
  next();
});

module.exports = mongoose.model('OptIn', optInSchema);