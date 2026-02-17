const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: String,
    phone: String
  },
  
  role: {
    type: String,
    enum: ['owner', 'admin', 'agent', 'viewer'],
    default: 'agent'
  },
  
  permissions: {
    conversations: {
      view: { type: Boolean, default: true },
      reply: { type: Boolean, default: true },
      assign: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    templates: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    analytics: {
      view: { type: Boolean, default: false }
    },
    billing: {
      view: { type: Boolean, default: false },
      manage: { type: Boolean, default: false }
    }
  },
  
  // WhatsApp Number Assignment
  assignedNumbers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppNumber'
  }],
  
  // Status & Activity
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLoginAt: Date,
  lastActiveAt: Date,
  
  // Security
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
userSchema.index({ businessId: 1, email: 1 });
userSchema.index({ businessId: 1, role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.role === 'owner' || this.role === 'admin') {
    this.permissions = {
      conversations: { view: true, reply: true, assign: true, delete: true },
      templates: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true },
      billing: { view: true, manage: this.role === 'owner' }
    };
  }
  next();
});

module.exports = mongoose.model('User', userSchema);