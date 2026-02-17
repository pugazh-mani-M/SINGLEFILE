const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again later' }
});

// Webhook limiter (more permissive)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // WhatsApp can send bursts
  message: { error: 'Webhook rate limit exceeded' }
});

// Message sending limiter
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20, // 20 messages per minute
  message: { error: 'Message rate limit exceeded' }
});

module.exports = { apiLimiter, authLimiter, webhookLimiter, messageLimiter };
