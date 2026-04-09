const XLSX = require('xlsx');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class ExcelImportService {
  async importUniversityData(filePath) {
    const workbook = XLSX.readFile(filePath);
    const results = {
      students: { success: 0, failed: 0, errors: [] },
      teachers: { success: 0, failed: 0, errors: [] },
      hr: { success: 0, failed: 0, errors: [] },
      parents: { success: 0, failed: 0, errors: [] }
    };
    
    if (workbook.SheetNames.includes('Students')) {
      const sheet = workbook.Sheets['Students'];
      const data = XLSX.utils.sheet_to_json(sheet);
      results.students = await this.importStudents(data);
    }
    
    if (workbook.SheetNames.includes('Teachers')) {
      const sheet = workbook.Sheets['Teachers'];
      const data = XLSX.utils.sheet_to_json(sheet);
      results.teachers = await this.importTeachers(data);
    }
    
    if (workbook.SheetNames.includes('HR_Staff')) {
      const sheet = workbook.Sheets['HR_Staff'];
      const data = XLSX.utils.sheet_to_json(sheet);
      results.hr = await this.importHR(data);
    }
    
    if (workbook.SheetNames.includes('Parents_Guardians')) {
      const sheet = workbook.Sheets['Parents_Guardians'];
      const data = XLSX.utils.sheet_to_json(sheet);
      results.parents = await this.importParents(data);
    }
    
    return results;
  }
  
  async importStudents(data) {
    let success = 0;
    let failed = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        const hashedPassword = await bcrypt.hash(row.password || 'password123', 12);
        
        const userData = {
          universityId: row.universityId,
          fullName: row.fullName,
          dateOfBirth: new Date(row.dateOfBirth),
          gender: row.gender,
          nationality: row.nationality,
          temporaryAddress: row.temporaryAddress,
          permanentAddress: row.permanentAddress,
          personalEmail: row.personalEmail,
          universityEmail: row.universityEmail,
          mobileNumber: row.mobileNumber,
          whatsappNumber: row.whatsappNumber,
          role: 'student',
          password: hashedPassword,
          collegeName: row.collegeName,
          universityRollNumber: row.universityRollNumber,
          collegeRollNumber: row.collegeRollNumber,
          course: row.course,
          groupSection: row.groupSection,
          batchYear: row.batchYear,
          currentSemester: row.currentSemester || 1,
          fatherName: row.fatherName,
          fatherMobile: row.fatherMobile,
          fatherWhatsapp: row.fatherWhatsapp,
          fatherEmail: row.fatherEmail,
          motherName: row.motherName,
          motherMobile: row.motherMobile,
          motherWhatsapp: row.motherWhatsapp,
          motherEmail: row.motherEmail,
          guardianName: row.guardianName,
          guardianMobile: row.guardianMobile,
          guardianWhatsapp: row.guardianWhatsapp,
          guardianEmail: row.guardianEmail,
          scholarshipProvider: row.scholarshipProvider,
          disabilityCategory: row.disabilityCategory,
          preferredLanguage: row.preferredLanguage || 'English',
          isActive: true
        };
        
        const existingUser = await User.findOne({ 
          $or: [{ universityId: userData.universityId }, { personalEmail: userData.personalEmail }]
        });
        
        if (!existingUser) {
          await User.create(userData);
          success++;
        } else {
          failed++;
          errors.push(`Student ${userData.universityId} already exists`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error importing student: ${error.message}`);
      }
    }
    
    return { success, failed, errors };
  }
  
  async importTeachers(data) {
  let success = 0;
  let failed = 0;
  const errors = [];
  
  for (const row of data) {
    try {
      // Hash the password before storing
      const plainPassword = row.password || 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      
      const userData = {
        universityId: row.employeeId,
        fullName: row.fullName,
        dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : new Date('1990-01-01'),
        gender: row.gender || 'male',
        nationality: row.nationality || 'Indian',
        temporaryAddress: row.temporaryAddress || 'University Campus',
        permanentAddress: row.permanentAddress || 'University Campus',
        personalEmail: row.personalEmail,
        universityEmail: row.universityEmail,
        mobileNumber: row.mobileNumber,
        whatsappNumber: row.whatsappNumber || row.mobileNumber,
        role: 'teacher',
        password: hashedPassword,  // Store HASHED password
        department: row.department,
        designation: row.designation,
        employeeId: row.employeeId,
        joiningDate: row.joiningDate ? new Date(row.joiningDate) : new Date(),
        salary: {
          basic: row.salaryBasic || 0,
          allowances: row.salaryAllowances || 0,
          deductions: row.salaryDeductions || 0,
          netSalary: (row.salaryBasic || 0) + (row.salaryAllowances || 0) - (row.salaryDeductions || 0)
        },
        preferredLanguage: row.preferredLanguage || 'English',
        isActive: true
      };
      
      const existingUser = await User.findOne({ 
        $or: [{ employeeId: userData.employeeId }, { personalEmail: userData.personalEmail }]
      });
      
      if (!existingUser) {
        await User.create(userData);
        success++;
      } else {
        failed++;
        errors.push(`Teacher ${userData.employeeId} already exists`);
      }
    } catch (error) {
      failed++;
      errors.push(`Error importing teacher: ${error.message}`);
    }
  }
  
  return { success, failed, errors };
  }
  
async importHR(data) {
  let success = 0;
  let failed = 0;
  const errors = [];
  
  for (const row of data) {
    try {
      // Hash the password before storing
      const plainPassword = row.password || 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      
      const userData = {
        universityId: row.employeeId,
        fullName: row.fullName,
        dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : new Date('1990-01-01'),
        gender: row.gender || 'male',
        nationality: row.nationality || 'Indian',
        temporaryAddress: row.temporaryAddress || 'University Campus',
        permanentAddress: row.permanentAddress || 'University Campus',
        personalEmail: row.personalEmail,
        universityEmail: row.universityEmail,
        mobileNumber: row.mobileNumber,
        whatsappNumber: row.whatsappNumber || row.mobileNumber,
        role: 'hr',
        password: hashedPassword,  // Store HASHED password
        department: 'HR Department',
        designation: row.designation || 'HR Manager',
        employeeId: row.employeeId,
        joiningDate: row.joiningDate ? new Date(row.joiningDate) : new Date(),
        salary: {
          basic: row.salaryBasic || 40000,
          allowances: row.salaryAllowances || 8000,
          deductions: row.salaryDeductions || 2000,
          netSalary: (row.salaryBasic || 40000) + (row.salaryAllowances || 8000) - (row.salaryDeductions || 2000)
        },
        preferredLanguage: row.preferredLanguage || 'English',
        isActive: true
      };
      
      const existingUser = await User.findOne({ 
        $or: [{ employeeId: userData.employeeId }, { personalEmail: userData.personalEmail }]
      });
      
      if (!existingUser) {
        await User.create(userData);
        success++;
        console.log(`✅ Imported HR: ${userData.fullName} (${userData.personalEmail})`);
      } else {
        failed++;
        errors.push(`HR Staff ${userData.employeeId} already exists`);
      }
    } catch (error) {
      failed++;
      errors.push(`Error importing HR: ${error.message}`);
      console.error(`❌ Failed to import HR row:`, error.message);
    }
  }
  
  return { success, failed, errors };
}
  
  async importParents(data) {
    let success = 0;
    let failed = 0;
    const errors = [];
    
    for (const row of data) {
      try {
        const student = await User.findOne({ universityId: row.studentUniversityId });
        if (student) {
          if (row.fatherName) student.fatherName = row.fatherName;
          if (row.fatherMobile) student.fatherMobile = row.fatherMobile;
          if (row.fatherWhatsapp) student.fatherWhatsapp = row.fatherWhatsapp;
          if (row.fatherEmail) student.fatherEmail = row.fatherEmail;
          if (row.motherName) student.motherName = row.motherName;
          if (row.motherMobile) student.motherMobile = row.motherMobile;
          if (row.motherWhatsapp) student.motherWhatsapp = row.motherWhatsapp;
          if (row.motherEmail) student.motherEmail = row.motherEmail;
          if (row.guardianName) student.guardianName = row.guardianName;
          if (row.guardianMobile) student.guardianMobile = row.guardianMobile;
          if (row.guardianWhatsapp) student.guardianWhatsapp = row.guardianWhatsapp;
          if (row.guardianEmail) student.guardianEmail = row.guardianEmail;
          await student.save();
          success++;
        } else {
          failed++;
          errors.push(`Student ${row.studentUniversityId} not found`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error importing parent data: ${error.message}`);
      }
    }
    
    return { success, failed, errors };
  }
  
  async validateExcelColumns(filePath) {
    const workbook = XLSX.readFile(filePath);
    const validation = { isValid: true, errors: [] };
    
    const requiredColumns = {
      'Students': ['universityId', 'fullName', 'personalEmail', 'universityEmail', 'mobileNumber', 'course'],
      'Teachers': ['employeeId', 'fullName', 'personalEmail', 'universityEmail', 'mobileNumber', 'department', 'designation'],
      'HR_Staff': ['employeeId', 'fullName', 'personalEmail', 'universityEmail', 'mobileNumber'],
      'Parents_Guardians': ['studentUniversityId']
    };
    
    for (const [sheetName, columns] of Object.entries(requiredColumns)) {
      if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        if (data.length > 0) {
          const firstRow = data[0];
          for (const col of columns) {
            if (!firstRow.hasOwnProperty(col)) {
              validation.isValid = false;
              validation.errors.push(`Sheet "${sheetName}" missing column: ${col}`);
            }
          }
        }
      }
    }
    
    return validation;
  }
}

module.exports = ExcelImportService;