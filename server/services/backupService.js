const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const User = require('../models/User');

class BackupService {
  constructor() {
    this.backupPath = path.join(__dirname, '../../backups');
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }
  
  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(this.backupPath, `backup_${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });
    
    const results = { success: true, timestamp: new Date(), files: [] };
    
    try {
      const users = await User.find().lean();
      
      const students = users.filter(u => u.role === 'student');
      const teachers = users.filter(u => u.role === 'teacher');
      const hrStaff = users.filter(u => u.role === 'hr');
      const admins = users.filter(u => u.role === 'admin');
      
      const studentSheet = XLSX.utils.json_to_sheet(students.map(s => ({
        universityId: s.universityId,
        fullName: s.fullName,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        personalEmail: s.personalEmail,
        universityEmail: s.universityEmail,
        mobileNumber: s.mobileNumber,
        collegeName: s.collegeName,
        universityRollNumber: s.universityRollNumber,
        course: s.course,
        currentSemester: s.currentSemester,
        fatherName: s.fatherName,
        fatherMobile: s.fatherMobile,
        motherName: s.motherName,
        motherMobile: s.motherMobile
      })));
      
      const teacherSheet = XLSX.utils.json_to_sheet(teachers.map(t => ({
        employeeId: t.employeeId,
        fullName: t.fullName,
        department: t.department,
        designation: t.designation,
        personalEmail: t.personalEmail,
        mobileNumber: t.mobileNumber,
        salaryBasic: t.salary?.basic,
        salaryNet: t.salary?.netSalary
      })));
      
      const hrSheet = XLSX.utils.json_to_sheet(hrStaff.map(h => ({
        employeeId: h.employeeId,
        fullName: h.fullName,
        personalEmail: h.personalEmail,
        mobileNumber: h.mobileNumber
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, studentSheet, 'Students');
      XLSX.utils.book_append_sheet(workbook, teacherSheet, 'Teachers');
      XLSX.utils.book_append_sheet(workbook, hrSheet, 'HR_Staff');
      
      const excelPath = path.join(backupFolder, `users_backup_${timestamp}.xlsx`);
      XLSX.writeFile(workbook, excelPath);
      results.files.push(excelPath);
      
      const metadataPath = path.join(backupFolder, `metadata_${timestamp}.json`);
      fs.writeFileSync(metadataPath, JSON.stringify({
        backupDate: new Date(),
        totalUsers: users.length,
        studentsCount: students.length,
        teachersCount: teachers.length,
        hrCount: hrStaff.length,
        adminCount: admins.length
      }, null, 2));
      results.files.push(metadataPath);
      
      await this.cleanOldBackups();
      
      return results;
    } catch (error) {
      return { success: false, error: error.message, timestamp: new Date() };
    }
  }
  
  async cleanOldBackups() {
    const backups = fs.readdirSync(this.backupPath)
      .filter(f => f.startsWith('backup_'))
      .map(f => ({
        name: f,
        path: path.join(this.backupPath, f),
        ctime: fs.statSync(path.join(this.backupPath, f)).ctime
      }))
      .sort((a, b) => b.ctime - a.ctime);
    
    const toDelete = backups.slice(10);
    for (const backup of toDelete) {
      fs.rmSync(backup.path, { recursive: true, force: true });
    }
  }
  
  async restoreFromBackup(backupFolderPath) {
    try {
      const excelFile = fs.readdirSync(backupFolderPath).find(f => f.endsWith('.xlsx'));
      if (!excelFile) {
        throw new Error('No Excel backup file found');
      }
      
      const workbook = XLSX.readFile(path.join(backupFolderPath, excelFile));
      
      await User.deleteMany({});
      
      if (workbook.SheetNames.includes('Students')) {
        const sheet = workbook.Sheets['Students'];
        const students = XLSX.utils.sheet_to_json(sheet);
        for (const student of students) {
          await User.create({
            ...student,
            role: 'student',
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYtT3YhJqZ3K'
          });
        }
      }
      
      if (workbook.SheetNames.includes('Teachers')) {
        const sheet = workbook.Sheets['Teachers'];
        const teachers = XLSX.utils.sheet_to_json(sheet);
        for (const teacher of teachers) {
          await User.create({
            ...teacher,
            role: 'teacher',
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYtT3YhJqZ3K'
          });
        }
      }
      
      return { success: true, message: 'Restore completed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async scheduleAutoBackup() {
    console.log('Auto-backup service initialized (will run every 24 hours)');
    
    // Run first backup after 1 minute
    setTimeout(async () => {
      console.log('Running initial auto-backup...');
      const result = await this.createFullBackup();
      if (result.success) {
        console.log(`✅ Initial backup completed: ${result.files.length} files created`);
      } else {
        console.error(`❌ Initial backup failed: ${result.error}`);
      }
    }, 60000); // 1 minute delay
    
    // Then every 24 hours
    const backupInterval = setInterval(async () => {
      console.log('Running scheduled backup...');
      const result = await this.createFullBackup();
      if (result.success) {
        console.log(`✅ Backup completed: ${result.files.length} files created`);
      } else {
        console.error(`❌ Backup failed: ${result.error}`);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Prevent interval from keeping process alive
    backupInterval.unref();
  }
}

module.exports = BackupService;