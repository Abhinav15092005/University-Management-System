const ChatbotAI = require('../services/ChatbotAI');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');

exports.processChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const chatbot = new ChatbotAI(user, user.role, require('mongoose'));
    const response = await chatbot.processMessage(message);
    
    // Save chat history
    await ChatHistory.create({
      userId: user._id,
      message: message,
      response: response,
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Error processing message. Please try again.' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};