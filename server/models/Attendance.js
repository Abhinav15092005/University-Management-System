const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], required: true },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  subject: { type: String },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String }
}, { timestamps: true });

// Compound index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);