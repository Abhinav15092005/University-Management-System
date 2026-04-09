const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Get all users (HR only)
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied. HR only.' });
    }
    
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user (HR only)
router.post('/add-user', protect, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied. HR only.' });
    }
    
    const { name, email, password, role, course, department, designation } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true
    });
    
    if (role === 'student') {
      await Student.create({
        userId: user._id,
        enrollmentNo: `STU${Date.now()}`,
        course: course || 'Not Assigned',
        semester: 1,
        batch: new Date().getFullYear().toString(),
        fees: { total: 50000, paid: 0, pending: 50000 }
      });
    } else if (role === 'teacher') {
      await Teacher.create({
        userId: user._id,
        employeeId: `TCH${Date.now()}`,
        department: department || 'Not Assigned',
        designation: designation || 'Assistant Professor',
        salary: { basic: 50000, allowances: 10000, deductions: 0 },
        joiningDate: new Date()
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'User added successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;