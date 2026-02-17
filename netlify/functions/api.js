const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('../../backend/src/routes/auth.routes');
const contactRoutes = require('../../backend/src/routes/contact.routes');
const messageRoutes = require('../../backend/src/routes/message.routes');
const webhookRoutes = require('../../backend/src/routes/webhook.routes');
const campaignRoutes = require('../../backend/src/routes/campaign.routes');

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/campaigns', campaignRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running on Netlify' });
});

// Netlify function handler
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  return serverless(app)(event, context);
};
