const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const multer = require('multer');
const ExcelImportService = require('../services/excelImportService');
const BackupService = require('../services/backupService');

const upload = multer({ dest: 'uploads/' });
const excelImportService = new ExcelImportService();
const backupService = new BackupService();

// Middleware to check admin role
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user by ID
router.get('/user/:userId', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by email
router.get('/user/email/:email', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/user/:userId', protect, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove password from updates if present (handle separately for security)
    delete updates.password;
    
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/user/:userId', protect, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete associated profile based on role
    if (user.role === 'student') {
      await Student.findOneAndDelete({ userId });
    } else if (user.role === 'teacher') {
      await Teacher.findOneAndDelete({ userId });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate/Deactivate user
router.patch('/user/:userId/toggle-status', protect, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT MANAGEMENT ====================

// Get all students
router.get('/students', protect, isAdmin, async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'name email personalEmail universityEmail mobileNumber');
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/student/:studentId', protect, isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('userId', 'name email personalEmail universityEmail mobileNumber');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/student/:studentId', protect, isAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;
    
    const student = await Student.findByIdAndUpdate(studentId, updates, { new: true });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ success: true, student, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/student/:studentId', protect, isAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(studentId);
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEACHER MANAGEMENT ====================

// Get all teachers
router.get('/teachers', protect, isAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('userId', 'name email personalEmail universityEmail mobileNumber');
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teacher by ID
router.get('/teacher/:teacherId', protect, isAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId).populate('userId', 'name email personalEmail universityEmail mobileNumber');
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update teacher
router.put('/teacher/:teacherId', protect, isAdmin, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = req.body;
    
    const teacher = await Teacher.findByIdAndUpdate(teacherId, updates, { new: true });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json({ success: true, teacher, message: 'Teacher updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete teacher
router.delete('/teacher/:teacherId', protect, isAdmin, async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    await User.findByIdAndDelete(teacher.userId);
    await Teacher.findByIdAndDelete(teacherId);
    
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EXCEL IMPORT/EXPORT ====================

// Import users from Excel file
router.post('/import-users', protect, isAdmin, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }
    
    const results = await excelImportService.importUniversityData(req.file.path);
    res.json({ 
      success: true, 
      results,
      message: `Import completed: ${results.students.success + results.teachers.success + results.hr.success} users added`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate Excel file before import
router.post('/import/validate', protect, isAdmin, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }
    
    const validation = await excelImportService.validateExcelColumns(req.file.path);
    if (validation.isValid) {
      res.json({ success: true, message: 'Excel file is valid', validation });
    } else {
      res.status(400).json({ success: false, errors: validation.errors });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export all users to Excel
router.get('/export-users', protect, isAdmin, async (req, res) => {
  try {
    const result = await backupService.createFullBackup();
    if (result.success && result.files.length > 0) {
      const latestBackup = result.files.find(f => f.endsWith('.xlsx'));
      if (latestBackup) {
        res.download(latestBackup, `users_export_${Date.now()}.xlsx`);
      } else {
        res.status(404).json({ error: 'No export file found' });
      }
    } else {
      res.status(500).json({ error: 'Export failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BACKUP MANAGEMENT ====================

// Create manual backup
router.post('/backup/create', protect, isAdmin, async (req, res) => {
  try {
    const result = await backupService.createFullBackup();
    if (result.success) {
      res.json({ success: true, message: 'Backup created successfully', files: result.files });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all backups
router.get('/backup/list', protect, isAdmin, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const backupPath = path.join(__dirname, '../../backups');
    
    if (!fs.existsSync(backupPath)) {
      return res.json({ backups: [] });
    }
    
    const backups = fs.readdirSync(backupPath)
      .filter(f => f.startsWith('backup_'))
      .map(f => ({
        name: f,
        path: path.join(backupPath, f),
        created: fs.statSync(path.join(backupPath, f)).ctime
      }))
      .sort((a, b) => b.created - a.created);
    
    res.json({ success: true, backups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore from backup
router.post('/backup/restore', protect, isAdmin, async (req, res) => {
  try {
    const { backupFolder } = req.body;
    
    if (!backupFolder) {
      return res.status(400).json({ error: 'Backup folder path required' });
    }
    
    const result = await backupService.restoreFromBackup(backupFolder);
    if (result.success) {
      res.json({ success: true, message: 'Restore completed successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATISTICS & DASHBOARD ====================

// Get system statistics
router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const students = await User.countDocuments({ role: 'student' });
    const teachers = await User.countDocuments({ role: 'teacher' });
    const hrStaff = await User.countDocuments({ role: 'hr' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        students,
        teachers,
        hrStaff,
        admins
      },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system health
router.get('/health', protect, isAdmin, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const backupPath = path.join(__dirname, '../../backups');
    
    const backups = fs.existsSync(backupPath) ? fs.readdirSync(backupPath).filter(f => f.startsWith('backup_')).length : 0;
    
    res.json({
      success: true,
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      backupsCount: backups,
      mongodb: 'connected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BULK OPERATIONS ====================

// Bulk update students semester
router.post('/bulk/update-semester', protect, isAdmin, async (req, res) => {
  try {
    const { currentSemester, newSemester } = req.body;
    
    const result = await Student.updateMany(
      { currentSemester: currentSemester },
      { $set: { currentSemester: newSemester } }
    );
    
    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} students to semester ${newSemester}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk deactivate users by role
router.post('/bulk/deactivate-by-role', protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    const result = await User.updateMany(
      { role: role },
      { $set: { isActive: false } }
    );
    
    res.json({
      success: true,
      message: `Deactivated ${result.modifiedCount} ${role}(s)`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYSTEM CONFIGURATION ====================

// Get system configuration
router.get('/config', protect, isAdmin, async (req, res) => {
  try {
    const config = {
      autoBackupEnabled: true,
      backupInterval: '24 hours',
      maxBackups: 10,
      semesterDuration: '6 months',
      defaultPassword: 'password123',
      supportedLanguages: ['English', 'Hindi'],
      version: '2.0.0'
    };
    
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;