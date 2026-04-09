const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  salary: {
    basic: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number }
  },
  joiningDate: { type: Date, required: true },
  qualification: { type: String },
  specialization: { type: String },
  subjects: [{ type: String }],
  reachTime: { type: String },
  leaveTime: { type: String },
  leaves: {
    total: { type: Number, default: 20 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 20 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

teacherSchema.pre('save', function(next) {
  this.salary.netSalary = this.salary.basic + this.salary.allowances - this.salary.deductions;
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);