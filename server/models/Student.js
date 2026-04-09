const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  enrollmentNo: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  batch: { type: String, required: true },
  fees: {
    total: { type: Number, required: true },
    paid: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    scholarshipDiscount: { type: Number, default: 0 }
  },
  parentDetails: {
    fatherName: String,
    motherName: String,
    fatherOccupation: String,
    annualIncome: Number,
    contact: String
  },
  scholarshipApplied: { type: Boolean, default: false },
  scholarshipStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);