const mongoose = require('mongoose');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const firstTimeSetup = async () => {
  try {
    // Check if any user exists
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📋 First time setup: No users found. Creating default admin from Excel...');
      
      // Create default admin Excel data
      const adminData = [{
        employeeId: 'ADMIN001',
        fullName: 'System Administrator',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        nationality: 'Indian',
        temporaryAddress: 'University Campus',
        permanentAddress: 'University Campus',
        personalEmail: 'admin@university.edu',
        universityEmail: 'admin@university.edu',
        mobileNumber: '9999999999',
        whatsappNumber: '9999999999',
        designation: 'System Administrator',
        joiningDate: new Date().toISOString().split('T')[0],
        salaryBasic: 50000,
        salaryAllowances: 10000,
        salaryDeductions: 5000,
        preferredLanguage: 'English',
        password: 'admin123'
      }];
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(adminData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'HR_Staff');
      
      // Save to temp file
      const tempExcelPath = path.join(__dirname, '../temp_admin.xlsx');
      XLSX.writeFile(workbook, tempExcelPath);
      
      // Import the admin user
      const ExcelImportService = require('../services/excelImportService');
      const importService = new ExcelImportService();
      const result = await importService.importUniversityData(tempExcelPath);
      
      // Clean up temp file
      fs.unlinkSync(tempExcelPath);
      
      console.log('✅ Default admin user created!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 LOGIN CREDENTIALS:');
      console.log('   Email: admin@university.edu');
      console.log('   Password: admin123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  Please change password after first login!');
    }
  } catch (error) {
    console.error('❌ First time setup error:', error.message);
  }
};

module.exports = firstTimeSetup;