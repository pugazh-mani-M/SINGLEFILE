const express = require('express');
const { auth } = require('../middleware/auth');
const {
  validateDataDeletion,
  handleValidationErrors,
  sensitiveOperationLimit
} = require('../middleware/inputValidation');
const router = express.Router();

router.post('/delete-account', auth, (req, res) => {
  res.json({ message: 'Account deletion requested' });
});

// Add data deletion endpoint for Meta compliance
router.post('/delete-user-data',
  sensitiveOperationLimit,
  validateDataDeletion,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { phoneNumber, userId } = req.body;
    
    if (!phoneNumber && !userId) {
      return res.status(400).json({ error: 'Phone number or user ID required' });
    }
    
    const { Message, Conversation, User } = require('../models');
    
    // Delete user data from all collections
    const deletionResults = {
      conversations: 0,
      messages: 0,
      userData: 0
    };
    
    if (phoneNumber) {
      // Delete by phone number
      const conversations = await Conversation.find({ phoneNumber });
      for (const conv of conversations) {
        deletionResults.messages = await Message.deleteMany({ conversationId: conv._id });
      }
      const convResult = await Conversation.deleteMany({ phoneNumber });
      deletionResults.conversations = convResult.deletedCount || 0;
    }
    
    if (userId) {
      // Delete by user ID
      const userResult = await User.deleteOne({ _id: userId });
      deletionResults.userData = userResult.deletedCount || 0;
    }
    
    res.json({
      success: true,
      message: 'User data deleted successfully',
      deletionResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Data deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

module.exports = router;