const Result = require('../models/Result');
const Student = require('../models/Student');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Publish results (Teacher/HR)
exports.publishResult = async (req, res) => {
  try {
    const { studentId, examType, semester, subjects } = req.body;
    
    let totalMarks = 0;
    let totalMaxMarks = 0;
    
    subjects.forEach(subject => {
      totalMarks += subject.marksObtained;
      totalMaxMarks += subject.maxMarks;
      
      // Calculate grade
      const percentage = (subject.marksObtained / subject.maxMarks) * 100;
      if (percentage >= 90) subject.grade = 'A+';
      else if (percentage >= 80) subject.grade = 'A';
      else if (percentage >= 70) subject.grade = 'B+';
      else if (percentage >= 60) subject.grade = 'B';
      else if (percentage >= 50) subject.grade = 'C';
      else if (percentage >= 40) subject.grade = 'D';
      else subject.grade = 'F';
    });
    
    const overallPercentage = (totalMarks / totalMaxMarks) * 100;
    const result = overallPercentage >= 40 ? 'pass' : 'fail';
    
    const resultData = await Result.create({
      studentId,
      examType,
      semester,
      subjects,
      totalMarks,
      maxMarks: totalMaxMarks,
      percentage: overallPercentage,
      result,
      publishedBy: req.user.id
    });
    
    res.json({
      success: true,
      message: 'Result published successfully',
      result: resultData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student results
exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const results = await Result.find({ studentId })
      .sort({ semester: -1, declaredDate: -1 });
    
    // Calculate performance trends
    const performanceTrend = results.map(r => ({
      examType: r.examType,
      semester: r.semester,
      percentage: r.percentage,
      result: r.result,
      date: r.declaredDate
    }));
    
    // Calculate CGPA (assuming 10-point scale)
    const totalPoints = results.reduce((sum, r) => sum + (r.percentage / 10), 0);
    const cgpa = results.length > 0 ? (totalPoints / results.length).toFixed(2) : 0;
    
    res.json({
      success: true,
      results,
      performanceTrend,
      cgpa,
      totalSemesters: results.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate PDF Result
exports.generateResultPDF = async (req, res) => {
  try {
    const { resultId } = req.params;
    
    const result = await Result.findById(resultId)
      .populate('studentId', 'enrollmentNo course semester')
      .populate('publishedBy', 'name');
    
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    const student = await Student.findById(result.studentId._id).populate('userId', 'name email');
    
    const doc = new PDFDocument();
    const filename = `result_${result.studentId.enrollmentNo}_${result.examType}_sem${result.semester}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    doc.pipe(res);
    
    // Design the PDF
    doc.fontSize(20).font('Helvetica-Bold').text('STUDENT RESULT CARD', { align: 'center' });
    doc.moveDown();
    
    // Add decorative line
    doc.strokeColor('#667eea').lineWidth(2).moveTo(50, 100).lineTo(550, 100).stroke();
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Student Name: ${student.userId.name}`, 50, 120);
    doc.text(`Enrollment No: ${result.studentId.enrollmentNo}`, 50, 140);
    doc.text(`Course: ${result.studentId.course}`, 50, 160);
    doc.text(`Semester: ${result.studentId.semester}`, 50, 180);
    doc.text(`Exam Type: ${result.examType.toUpperCase()}`, 50, 200);
    doc.text(`Result Date: ${new Date(result.declaredDate).toLocaleDateString()}`, 50, 220);
    
    doc.moveDown();
    
    // Subjects table
    let y = 260;
    doc.font('Helvetica-Bold').text('Subject', 50, y);
    doc.text('Marks Obtained', 200, y);
    doc.text('Max Marks', 350, y);
    doc.text('Grade', 450, y);
    
    y += 20;
    doc.font('Helvetica');
    
    result.subjects.forEach(subject => {
      doc.text(subject.name, 50, y);
      doc.text(subject.marksObtained.toString(), 200, y);
      doc.text(subject.maxMarks.toString(), 350, y);
      doc.text(subject.grade, 450, y);
      y += 20;
    });
    
    y += 20;
    doc.font('Helvetica-Bold').text(`Total Marks: ${result.totalMarks} / ${result.maxMarks}`, 50, y);
    y += 20;
    doc.text(`Percentage: ${result.percentage.toFixed(2)}%`, 50, y);
    y += 20;
    doc.text(`Result: ${result.result.toUpperCase()}`, 50, y);
    y += 20;
    doc.text(`Published By: ${result.publishedBy.name}`, 50, y);
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};