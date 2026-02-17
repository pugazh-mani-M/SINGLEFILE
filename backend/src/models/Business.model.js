const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['retail', 'ecommerce', 'restaurant', 'healthcare', 'education', 'real-estate', 'finance', 'technology', 'other'],
    default: 'other'
  },
  address: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  website: String,
  industry: String,
  
  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    nextBillingDate: Date,
    limits: {
      conversations: { type: Number, default: 1000 },
      agents: { type: Number, default: 5 },
      whatsappNumbers: { type: Number, default: 1 }
    }
  },

  // Meta Integration
  meta: {
    appId: String,
    businessId: String,
    systemUserToken: String, // Encrypted
    webhookToken: String     // Encrypted
  },

  // Settings
  settings: {
    timezone: { type: String, default: 'UTC' },
    businessHours: {
      enabled: { type: Boolean, default: false },
      schedule: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        start: String, // "09:00"
        end: String    // "17:00"
      }]
    },
    autoAssignment: { type: Boolean, default: true },
    aiEnabled: { type: Boolean, default: false }
  },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

businessSchema.index({ slug: 1 });
businessSchema.index({ email: 1 });

module.exports = mongoose.model('Business', businessSchema);