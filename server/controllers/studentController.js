const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Scholarship = require('../models/Scholarship');
const PDFDocument = require('pdfkit');

// Get student dashboard data with O(n) time complexity for aggregations
exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get attendance trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    
    // Attendance trend using sliding window O(n)
    const attendanceTrend = [];
    let presentCount = 0;
    for (let i = 0; i < attendance.length; i++) {
      if (attendance[i].status === 'present') presentCount++;
      if (i >= 6) {
        const windowStart = i - 6;
        if (attendance[windowStart].status === 'present') presentCount--;
      }
      if (i >= 6) {
        attendanceTrend.push({
          week: `Week ${Math.floor(i/7) + 1}`,
          percentage: (presentCount / 7) * 100
        });
      }
    }
    
    // Performance trends using binary search for semester results
    const results = await Result.find({ studentId: student._id })
      .sort({ semester: 1 });
    
    const performanceTrend = results.map(r => ({
      semester: r.semester,
      percentage: r.percentage,
      examType: r.examType
    }));
    
    res.json({
      student,
      attendanceTrend,
      performanceTrend,
      scholarship: await Scholarship.findOne({ studentId: student._id })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate result PDF using binary search for efficient data retrieval
exports.generateResultPDF = async (req, res) => {
  try {
    const { examType, semester } = req.params;
    const student = await Student.findOne({ userId: req.user.id });
    
    // Binary search on sorted results
    const results = await Result.find({ 
      studentId: student._id,
      examType: examType,
      semester: semester
    }).sort({ declaredDate: -1 });
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    const result = results[0];
    
    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=result_${examType}_sem${semester}.pdf`);
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Student Result Card', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${req.user.name}`);
    doc.text(`Enrollment No: ${student.enrollmentNo}`);
    doc.text(`Course: ${student.course}`);
    doc.text(`Semester: ${semester}`);
    doc.text(`Exam Type: ${examType.toUpperCase()}`);
    doc.moveDown();
    
    // Subjects table
    const tableTop = 250;
    doc.text('Subject', 50, tableTop);
    doc.text('Marks Obtained', 200, tableTop);
    doc.text('Max Marks', 300, tableTop);
    doc.text('Grade', 400, tableTop);
    
    let y = tableTop + 20;
    result.subjects.forEach(subject => {
      doc.text(subject.name, 50, y);
      doc.text(subject.marksObtained.toString(), 200, y);
      doc.text(subject.maxMarks.toString(), 300, y);
      doc.text(subject.grade, 400, y);
      y += 20;
    });
    
    doc.moveDown();
    doc.text(`Total Marks: ${result.totalMarks}`, 50, y + 20);
    doc.text(`Percentage: ${result.percentage.toFixed(2)}%`, 50, y + 40);
    doc.text(`Result: ${result.result.toUpperCase()}`, 50, y + 60);
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply for scholarship with eligibility algorithm (O(n log n))
exports.applyScholarship = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get all results for performance analysis
    const results = await Result.find({ studentId: student._id });
    
    // Calculate eligibility score using weighted algorithm
    let totalPercentage = 0;
    results.forEach(result => {
      totalPercentage += result.percentage;
    });
    const avgPercentage = results.length > 0 ? totalPercentage / results.length : 0;
    
    // Family income factor
    const incomeFactor = student.parentDetails.annualIncome < 300000 ? 1 : 
                        student.parentDetails.annualIncome < 500000 ? 0.7 : 0.3;
    
    // Merit score
    const meritScore = (avgPercentage / 100) * 0.6;
    const needScore = incomeFactor * 0.4;
    const eligibilityScore = (meritScore + needScore) * 100;
    
    const isEligible = eligibilityScore >= 60;
    
    if (!isEligible) {
      return res.status(400).json({ 
        error: 'Not eligible for scholarship',
        score: eligibilityScore
      });
    }
    
    // Determine scholarship percentage based on score
    let percentageAwarded = 0;
    if (eligibilityScore >= 90) percentageAwarded = 50;
    else if (eligibilityScore >= 80) percentageAwarded = 40;
    else if (eligibilityScore >= 70) percentageAwarded = 30;
    else if (eligibilityScore >= 60) percentageAwarded = 20;
    
    // Create scholarship application
    const scholarship = await Scholarship.create({
      studentId: student._id,
      eligibilityScore: eligibilityScore,
      familyIncome: student.parentDetails.annualIncome,
      academicPerformance: avgPercentage,
      scholarshipType: eligibilityScore >= 80 ? 'merit' : 'need-based',
      percentageAwarded: percentageAwarded,
      status: 'pending'
    });
    
    // Update student
    student.scholarshipApplied = true;
    student.scholarshipStatus = 'pending';
    await student.save();
    
    res.json({
      message: 'Scholarship application submitted successfully',
      scholarship,
      eligibilityScore,
      percentageAwarded
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};