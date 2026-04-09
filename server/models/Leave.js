const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['student', 'teacher'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leaveType: { type: String, enum: ['sick', 'casual', 'emergency', 'other'] }
}, { timestamps: true });

leaveSchema.index({ userId: 1, status: 1 });
module.exports = mongoose.model('Leave', leaveSchema);