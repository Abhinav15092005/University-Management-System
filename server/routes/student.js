const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

// Get student profile
router.get('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email phone');
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student profile
router.put('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    res.json({
      attendanceTrend: [],
      message: 'Student dashboard data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;