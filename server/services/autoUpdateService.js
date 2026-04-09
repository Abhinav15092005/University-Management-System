const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');

class AutoUpdateService {
  
  async updateSemesterProgression() {
    const students = await User.find({ role: 'student', isActive: true });
    let updated = 0;
    
    for (const student of students) {
      const currentSemester = student.currentSemester || 1;
      if (currentSemester < 8) {
        student.currentSemester = currentSemester + 1;
        await student.save();
        updated++;
      }
    }
    
    return { updated, message: `Advanced ${updated} students to next semester` };
  }
  
  async recalculateAttendance() {
    const students = await User.find({ role: 'student' });
    const results = [];
    
    for (const student of students) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const attendance = await Attendance.find({
        studentId: student._id,
        date: { $gte: startOfMonth }
      });
      
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      results.push({
        studentId: student.universityId,
        studentName: student.fullName,
        attendancePercentage: percentage.toFixed(2)
      });
    }
    
    return { results, message: `Recalculated attendance for ${students.length} students` };
  }
  
  async predictAttendance(studentId, currentPercentage, daysRemaining) {
    const historicalData = await Attendance.find({ studentId })
      .sort({ date: -1 })
      .limit(30);
    
    const attendanceRate = historicalData.filter(a => a.status === 'present').length / historicalData.length;
    const predictedRate = (attendanceRate * 0.7) + (currentPercentage / 100 * 0.3);
    const predictedFinal = (currentPercentage * (30 - daysRemaining) / 30) + (predictedRate * daysRemaining / 30) * 100;
    
    return {
      currentPercentage: currentPercentage.toFixed(1),
      predictedFinalPercentage: predictedFinal.toFixed(1),
      probabilityToReach75: predictedFinal >= 75 ? 'High' : 'Low',
      recommendation: predictedFinal >= 75 ? 'On track' : 'Need to improve'
    };
  }
  
  async predictPerformance(studentId, currentGrades) {
    const previousResults = await Result.find({ studentId }).sort({ semester: -1 }).limit(3);
    
    if (previousResults.length === 0) {
      return { prediction: 'Insufficient data' };
    }
    
    const avgPrevious = previousResults.reduce((sum, r) => sum + r.percentage, 0) / previousResults.length;
    const trend = previousResults[0].percentage - previousResults[previousResults.length - 1].percentage;
    const predictedGrade = avgPrevious + (trend * 0.5);
    
    let gradePrediction = '';
    if (predictedGrade >= 85) gradePrediction = 'Excellent (A+)';
    else if (predictedGrade >= 75) gradePrediction = 'Very Good (A)';
    else if (predictedGrade >= 65) gradePrediction = 'Good (B+)';
    else if (predictedGrade >= 55) gradePrediction = 'Average (B)';
    else if (predictedGrade >= 45) gradePrediction = 'Below Average (C)';
    else gradePrediction = 'Needs Improvement (D)';
    
    return {
      predictedPercentage: predictedGrade.toFixed(1),
      predictedGrade: gradePrediction,
      confidenceLevel: previousResults.length >= 3 ? 'High' : 'Medium'
    };
  }
  
  async calculateScholarshipProbability(studentId, familyIncome, academicScore) {
    let probability = 0;
    let scholarshipPercentage = 0;
    
    const academicContribution = (academicScore / 100) * 60;
    
    let incomeContribution = 0;
    if (familyIncome < 200000) incomeContribution = 40;
    else if (familyIncome < 300000) incomeContribution = 35;
    else if (familyIncome < 400000) incomeContribution = 30;
    else if (familyIncome < 500000) incomeContribution = 25;
    else if (familyIncome < 600000) incomeContribution = 20;
    else if (familyIncome < 700000) incomeContribution = 15;
    else if (familyIncome < 800000) incomeContribution = 10;
    else if (familyIncome < 900000) incomeContribution = 5;
    else incomeContribution = 0;
    
    probability = academicContribution + incomeContribution;
    
    if (probability >= 90) scholarshipPercentage = 50;
    else if (probability >= 80) scholarshipPercentage = 40;
    else if (probability >= 70) scholarshipPercentage = 30;
    else if (probability >= 60) scholarshipPercentage = 20;
    else if (probability >= 50) scholarshipPercentage = 10;
    else scholarshipPercentage = 0;
    
    return {
      probabilityScore: probability.toFixed(1),
      scholarshipPercentage: scholarshipPercentage,
      eligibilityStatus: probability >= 60 ? 'Eligible' : 'Not Eligible',
      recommendation: probability >= 60 ? 'Apply for scholarship' : 'Focus on improving grades'
    };
  }
  
  async predictFeeDueDate(studentId, lastPaymentDate, pendingAmount, monthlyFee) {
    const monthsOverdue = Math.floor(pendingAmount / monthlyFee);
    const predictedDueDate = new Date(lastPaymentDate);
    predictedDueDate.setMonth(predictedDueDate.getMonth() + monthsOverdue);
    
    const today = new Date();
    const isOverdue = predictedDueDate < today;
    
    return {
      predictedDueDate: predictedDueDate.toISOString().split('T')[0],
      monthsOverdue: monthsOverdue,
      isOverdue: isOverdue,
      urgencyLevel: isOverdue ? 'High - Immediate payment required' : 'Normal - Pay before due date'
    };
  }
  
  async scheduleUpdates() {
    console.log('Auto-update service initialized (will run on schedule)');
    
    // Semester progression (every 6 months = 180 days)
    // Use 180 days instead of milliseconds to avoid overflow
    const sixMonthsInMs = 180 * 24 * 60 * 60 * 1000;
    
    // Check if value is safe (within 32-bit signed integer limit)
    // 2^31 - 1 = 2147483647 ms = about 24.8 days
    // So we need to use a smaller interval and count iterations
    
    let semesterCounter = 0;
    const semesterInterval = setInterval(async () => {
      semesterCounter++;
      // Run every 30 days (check for semester progression)
      if (semesterCounter % 6 === 0) { // Every 6 months (6 * 30 days)
        console.log('Checking semester progression...');
        const result = await this.updateSemesterProgression();
        console.log(result.message);
      }
    }, 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Attendance recalculation (daily at midnight)
    setInterval(async () => {
      console.log('Running attendance recalculation...');
      const result = await this.recalculateAttendance();
      console.log(result.message);
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Prevent intervals from keeping process alive
    semesterInterval.unref();
    
    console.log('Auto-update schedules set');
  }
}

module.exports = AutoUpdateService;