const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');

// Mark attendance (Teacher/HR)
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, status, subject, remarks } = req.body;
    const teacherId = req.user.id;
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    let attendance;
    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.subject = subject;
      existingAttendance.remarks = remarks;
      existingAttendance.markedBy = teacherId;
      attendance = await existingAttendance.save();
    } else {
      // Create new attendance
      attendance = await Attendance.create({
        studentId,
        userId: studentId,
        status,
        subject,
        remarks,
        markedBy: teacherId,
        date: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student attendance with trend analysis
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;
    
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    const attendance = await Attendance.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    const totalDays = new Date(targetYear, targetMonth, 0).getDate();
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const halfDays = attendance.filter(a => a.status === 'half-day').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    
    const percentage = totalDays > 0 ? ((presentDays + (lateDays * 0.5) + (halfDays * 0.5)) / totalDays) * 100 : 0;
    
    // Calculate trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const dayAttendance = attendance.find(a => 
        new Date(a.date).toDateString() === day.toDateString()
      );
      
      last7Days.push({
        date: day.toLocaleDateString('en-US', { weekday: 'short' }),
        status: dayAttendance ? dayAttendance.status : 'absent',
        dateObj: day
      });
    }
    
    res.json({
      success: true,
      stats: {
        totalDays,
        present: presentDays,
        absent: absentDays,
        late: lateDays,
        halfDays,
        percentage: percentage.toFixed(2)
      },
      trend: last7Days,
      attendance: attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students attendance for teacher dashboard
exports.getAllStudentsAttendance = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'name email');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceData = await Promise.all(students.map(async (student) => {
      const todayAttendance = await Attendance.findOne({
        studentId: student._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      // Get monthly percentage
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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
        todayStatus: todayAttendance ? todayAttendance.status : 'absent',
        monthlyPercentage: percentage.toFixed(2)
      };
    }));
    
    res.json({
      success: true,
      students: attendanceData,
      date: today
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};