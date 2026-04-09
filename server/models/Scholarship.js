const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  applicationDate: { type: Date, default: Date.now },
  eligibilityScore: Number,
  familyIncome: Number,
  academicPerformance: Number,
  scholarshipType: { type: String, enum: ['merit', 'need-based', 'sports', 'special'] },
  percentageAwarded: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: String
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);