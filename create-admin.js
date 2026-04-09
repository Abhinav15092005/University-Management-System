const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sms');
    
    const User = mongoose.model('User', new mongoose.Schema({
      universityId: String,
      fullName: String,
      personalEmail: String,
      universityEmail: String,
      mobileNumber: String,
      role: String,
      password: String,
      isActive: Boolean,
      dateOfBirth: Date,
      gender: String,
      nationality: String,
      temporaryAddress: String,
      permanentAddress: String
    }));
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        universityId: 'ADMIN001',
        fullName: 'System Administrator',
        personalEmail: 'admin@university.edu',
        universityEmail: 'admin@university.edu',
        mobileNumber: '9999999999',
        role: 'admin',
        password: hashedPassword,
        isActive: true,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        nationality: 'Indian',
        temporaryAddress: 'University Campus',
        permanentAddress: 'University Campus'
      });
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAdmin();