const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { processChat, getChatHistory } = require('../controllers/chatbotController');

router.post('/process', protect, processChat);
router.get('/history', protect, getChatHistory);

module.exports = router;