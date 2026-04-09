const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  intent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

chatHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);