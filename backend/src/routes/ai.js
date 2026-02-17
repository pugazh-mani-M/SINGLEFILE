const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/settings', auth, (req, res) => {
  res.json({
    autoResponseEnabled: true,
    businessHours: {
      enabled: true,
      start: '09:00',
      end: '18:00',
      weekdays: [1, 2, 3, 4, 5]
    },
    responseDelay: 30,
    keywords: []
  });
});

router.put('/settings', auth, (req, res) => {
  res.json({ message: 'Settings updated successfully' });
});

router.post('/test-response', auth, (req, res) => {
  const { message } = req.body;
  res.json({ 
    response: `AI Response: Thank you for your message "${message}". How can I help you today?` 
  });
});

module.exports = router;