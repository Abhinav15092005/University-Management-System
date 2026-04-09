const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  universityId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  nationality: { type: String, required: true },
  temporaryAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  personalEmail: { type: String, required: true, unique: true },
  universityEmail: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  whatsappNumber: { type: String },
  role: { type: String, enum: ['student', 'teacher', 'hr', 'admin'], required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  collegeName: { type: String }, // For students
  universityRollNumber: { type: String }, // For students
  collegeRollNumber: { type: String }, // For students
  course: { type: String }, // For students
  groupSection: { type: String }, // For students
  batchYear: { type: String }, // For students
  currentSemester: { type: Number }, // For students
  department: { type: String }, // For employees
  designation: { type: String }, // For employees
  employeeId: { type: String }, // For employees
  joiningDate: { type: Date }, // For employees
  salary: {
    basic: { type: Number },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number }
  },
  fatherName: { type: String },
  fatherMobile: { type: String },
  fatherWhatsapp: { type: String },
  fatherEmail: { type: String },
  motherName: { type: String },
  motherMobile: { type: String },
  motherWhatsapp: { type: String },
  motherEmail: { type: String },
  guardianName: { type: String },
  guardianMobile: { type: String },
  guardianWhatsapp: { type: String },
  guardianEmail: { type: String },
  profilePic: { type: String, default: 'default-avatar.png' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);