const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

router.get('/profile', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }
    res.json({ teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students', protect, async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'name email');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const studentsWithAttendance = await Promise.all(students.map(async (student) => {
      const monthlyAttendance = await Attendance.find({
        studentId: student._id,
        date: { $gte: startOfMonth }
      });
      
      const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return {
        id: student._id,
        name: student.userId.name,
        enrollmentNo: student.enrollmentNo,
        course: student.course,
        semester: student.semester,
        monthlyPercentage: percentage.toFixed(2)
      };
    }));
    
    res.json({ students: studentsWithAttendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;