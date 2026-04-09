const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  markAttendance,
  getStudentAttendance,
  getAllStudentsAttendance
} = require('../controllers/attendanceController');

router.post('/mark', protect, markAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);
router.get('/all-students', protect, getAllStudentsAttendance);

module.exports = router;