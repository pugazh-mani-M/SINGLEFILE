const express = require('express');
const { auth } = require('../middleware/auth');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const TestMessage = require('../models/MessageSimple.model');
const router = express.Router();

// Get all conversations with counts
router.get('/', auth, async (req, res) => {
  try {
    console.log('📬 Fetching conversations from MongoDB...');
    
    // Get conversations with latest message
    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();
    
    // Also get test messages and convert them to conversation format
    const testMessages = await TestMessage.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    console.log(`📊 Found ${conversations.length} conversations and ${testMessages.length} test messages`);
    
    // Convert test messages to conversation format
    const testConversations = testMessages.map(msg => ({
      id: msg._id,
      phone: msg.phone,
      name: msg.phone,
      lastMessage: msg.text,
      lastMessageAt: msg.createdAt,
      status: 'open',
      unreadCount: 0,
      test_mode: true
    }));
    
    // Combine real conversations and test conversations
    const allConversations = [...conversations.map(conv => ({
      id: conv._id,
      phone: conv.customer?.phoneNumber || 'Unknown',
      name: conv.customer?.name || conv.customer?.phoneNumber || 'Unknown',
      lastMessage: conv.lastMessage || 'No messages',
      lastMessageAt: conv.lastMessageAt || conv.createdAt,
      status: conv.status || 'open',
      unreadCount: 0,
      test_mode: false
    })), ...testConversations];
    
    // Sort by last message time
    allConversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    
    const counts = {
      all: allConversations.length,
      open: allConversations.filter(c => c.status === 'open').length,
      pending: allConversations.filter(c => c.status === 'pending').length,
      closed: allConversations.filter(c => c.status === 'closed').length
    };
    
    console.log('✅ Conversations formatted for frontend');
    
    res.json({
      conversations: allConversations || [],
      counts,
      total: allConversations ? allConversations.length : 0
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(200).json({ 
      conversations: [],
      counts: { all: 0, open: 0, pending: 0, closed: 0 },
      total: 0
    });
  }
});

// Get conversation by ID with messages
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router;