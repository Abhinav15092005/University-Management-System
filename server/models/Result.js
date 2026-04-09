const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examType: { type: String, enum: ['mst1', 'mst2', 'final', 'quiz', 'assignment'], required: true },
  semester: { type: Number, required: true },
  subjects: [{
    name: String,
    code: String,
    marksObtained: Number,
    maxMarks: Number,
    grade: String
  }],
  totalMarks: Number,
  percentage: Number,
  result: { type: String, enum: ['pass', 'fail'] },
  declaredDate: { type: Date, default: Date.now },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

resultSchema.index({ studentId: 1, examType: 1 });
resultSchema.index({ semester: 1 });

module.exports = mongoose.model('Result', resultSchema);