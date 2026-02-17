const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const db = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = db;
  return db;
}

// Import routes
const authRoutes = require('../../backend/src/routes/auth');
const conversationsRoutes = require('../../backend/src/routes/conversations');
const messagesRoutes = require('../../backend/src/routes/messages');
const webhookRoutes = require('../../backend/src/routes/webhook.routes');
const whatsappRoutes = require('../../backend/src/routes/whatsapp.routes');
const templateRoutes = require('../../backend/src/routes/template.routes');
const analyticsRoutes = require('../../backend/src/routes/analytics');
const aiRoutes = require('../../backend/src/routes/ai');
const mobileRoutes = require('../../backend/src/routes/mobile');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mobile', mobileRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running on Netlify' });
});

// Netlify function handler
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverless(app)(event, context);
};
