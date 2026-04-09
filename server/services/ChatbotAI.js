const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Result = require('../models/Result');
const Scholarship = require('../models/Scholarship');

class ChatbotAI {
  constructor(user, role, db) {
    this.user = user;
    this.role = role;
    this.db = db;
  }
  
  async processMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    // Improved word matching with synonyms
    const containsWord = (words) => words.some(word => lowerMsg.includes(word));
    
    // Attendance detection
    if (containsWord(['attendance', 'present', 'absent', 'percentage', 'how many days', 'attended', 'missed'])) {
      return await this.handleAttendance(message);
    }
    
    // Salary detection  
    if (containsWord(['salary', 'payment', 'pay', 'earning', 'deduction', 'income', 'wage', 'monthly'])) {
      return await this.handleSalary(message);
    }
    
    // Fees detection
    if (containsWord(['fee', 'fees', 'dues', 'pending', 'payment', 'scholarship discount', 'tuition'])) {
      return await this.handleFees();
    }
    
    // Results/Marks detection
    if (containsWord(['mark', 'marks', 'result', 'grade', 'cgpa', 'score', 'percentage', 'exam', 'gpa', 'performance'])) {
      return await this.handleResults();
    }
    
    // Scholarship detection
    if (containsWord(['scholarship', 'financial', 'aid', 'assistantship', 'merit', 'eligible', 'eligibility'])) {
      return await this.handleScholarship();
    }
    
    // Calculations detection
    if (containsWord(['calculate', 'compute', 'how much', 'total', 'sum', 'average', 'add', 'subtract', 'multiply', 'divide'])) {
      return await this.handleCalculation(message);
    }
    
    // Leave detection
    if (containsWord(['leave', 'holiday', 'time off', 'vacation', 'absent'])) {
      if (this.role === 'teacher') {
        return await this.handleSalary(message);
      }
      return await this.getLeaveInfo();
    }
    
    return this.getDefaultResponse();
    
    // Attendance queries
    if (lowerMsg.includes('attendance') || lowerMsg.includes('present') || lowerMsg.includes('absent')) {
      return await this.handleAttendance(message);
    }
    
    // Salary queries
    if (lowerMsg.includes('salary') || lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
      return await this.handleSalary(message);
    }
    
    // Fees queries
    if (lowerMsg.includes('fee') || lowerMsg.includes('fees') || lowerMsg.includes('dues')) {
      return await this.handleFees();
    }
    
    // Results/Marks queries
    if (lowerMsg.includes('mark') || lowerMsg.includes('result') || lowerMsg.includes('grade') || lowerMsg.includes('cgpa')) {
      return await this.handleResults();
    }
    
    // Scholarship queries
    if (lowerMsg.includes('scholarship') || lowerMsg.includes('financial')) {
      return await this.handleScholarship();
    }
    
    // Calculations
    if (lowerMsg.includes('calculate') || lowerMsg.includes('compute') || lowerMsg.includes('how much')) {
      return await this.handleCalculation(message);
    }
    
    // Default response with suggestions
    return this.getDefaultResponse();
  }
  
  async handleAttendance(message) {
    if (this.role === 'student') {
      const student = await Student.findOne({ userId: this.user._id });
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const attendance = await Attendance.find({
        studentId: student._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const totalDays = endOfMonth.getDate();
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const lateDays = attendance.filter(a => a.status === 'late').length;
      const percentage = ((presentDays + (lateDays * 0.5)) / totalDays) * 100;
      
      // Check if message contains projection query
      if (message.toLowerCase().includes('if i attend')) {
        const numbers = message.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          const daysToAttend = parseInt(numbers[0]);
          const remainingDays = totalDays - attendance.length;
          if (daysToAttend <= remainingDays) {
            const newPresent = presentDays + daysToAttend;
            const newPercentage = (newPresent / totalDays) * 100;
            return `📊 If you attend next ${daysToAttend} days:\n• Current: ${percentage.toFixed(1)}%\n• Projected: ${newPercentage.toFixed(1)}%\n• ${newPercentage >= 75 ? '✅ You will meet 75% requirement!' : '⚠️ You will still need to improve attendance.'}`;
          }
        }
      }
      
      return `📊 Your Attendance Report for ${today.toLocaleString('default', { month: 'long' })}:\n\n✅ Present: ${presentDays} days\n⚠️ Late: ${lateDays} days\n❌ Absent: ${totalDays - attendance.length} days\n📈 Percentage: ${percentage.toFixed(1)}%\n\n${percentage >= 75 ? '🎉 Good job! You\'re meeting the 75% requirement!' : '⚠️ Your attendance is below 75%. Please improve!'}`;
    }
    return "Attendance information is available in your dashboard.";
  }
  
  async handleSalary(message) {
    if (this.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: this.user._id });
      const perDaySalary = teacher.salary.basic / 30;
      const leaveDeduction = perDaySalary * teacher.leaves.used;
      const netSalary = teacher.salary.netSalary - leaveDeduction;
      
      // Check for leave projection
      if (message.toLowerCase().includes('leave') || message.toLowerCase().includes('deduction')) {
        const numbers = message.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          const daysOff = parseInt(numbers[0]);
          const deduction = perDaySalary * daysOff;
          const newSalary = netSalary - deduction;
          return `💰 Salary Projection:\n• Per Day: ₹${perDaySalary.toFixed(2)}\n• Deduction for ${daysOff} days: ₹${deduction.toFixed(2)}\n• New Salary: ₹${newSalary.toFixed(2)}`;
        }
      }
      
      return `💰 Your Salary Details:\n\n📊 Basic: ₹${teacher.salary.basic}\n✨ Allowances: ₹${teacher.salary.allowances}\n📉 Deductions: ₹${teacher.salary.deductions}\n🏖️ Leave Deduction: ₹${leaveDeduction.toFixed(2)}\n💵 Net Salary: ₹${netSalary.toFixed(2)}\n\n📅 Leaves Used: ${teacher.leaves.used}/${teacher.leaves.total}\n📊 Remaining Leaves: ${teacher.leaves.remaining}`;
    }
    return "Salary information is only available for teachers.";
  }
  
  async handleFees() {
    if (this.role === 'student') {
      const student = await Student.findOne({ userId: this.user._id });
      const scholarshipAmount = (student.fees.total * student.fees.scholarshipDiscount) / 100;
      const pendingAfterScholarship = student.fees.pending - scholarshipAmount;
      
      return `💰 Fee Details:\n\n📊 Total Fees: ₹${student.fees.total}\n✅ Paid: ₹${student.fees.paid}\n⚠️ Pending: ₹${student.fees.pending}\n🎓 Scholarship: ${student.fees.scholarshipDiscount}% (₹${scholarshipAmount.toFixed(2)})\n💵 Net Payable: ₹${pendingAfterScholarship.toFixed(2)}\n\n${student.scholarshipStatus === 'approved' ? '🎉 Scholarship Approved! You get discount!' : student.scholarshipStatus === 'pending' ? '⏳ Scholarship application under review.' : '💡 You can apply for scholarship if eligible.'}`;
    }
    return "Fee details are available in your student dashboard.";
  }
  
  async handleResults() {
    if (this.role === 'student') {
      const student = await Student.findOne({ userId: this.user._id });
      const results = await Result.find({ studentId: student._id })
        .sort({ semester: -1 })
        .limit(3);
      
      if (results.length === 0) {
        return "📚 No results published yet. Check back after exams!";
      }
      
      let response = "📊 Your Recent Results:\n\n";
      results.forEach(result => {
        response += `📚 ${result.examType.toUpperCase()} - Sem ${result.semester}\n`;
        response += `📈 Percentage: ${result.percentage.toFixed(2)}%\n`;
        response += `🎯 Result: ${result.result.toUpperCase()}\n`;
        response += `📅 Date: ${new Date(result.declaredDate).toLocaleDateString()}\n\n`;
      });
      
      // Calculate CGPA
      const allResults = await Result.find({ studentId: student._id });
      const totalPoints = allResults.reduce((sum, r) => sum + (r.percentage / 10), 0);
      const cgpa = allResults.length > 0 ? (totalPoints / allResults.length).toFixed(2) : 0;
      response += `⭐ Overall CGPA: ${cgpa}/10`;
      
      return response;
    }
    return "Results are available in your dashboard.";
  }
  
  async handleScholarship() {
    if (this.role === 'student') {
      const student = await Student.findOne({ userId: this.user._id });
      const results = await Result.find({ studentId: student._id });
      
      // Calculate eligibility score
      let totalPercentage = 0;
      results.forEach(r => totalPercentage += r.percentage);
      const avgPercentage = results.length > 0 ? totalPercentage / results.length : 0;
      
      // Income factor
      const incomeFactor = student.parentDetails?.annualIncome < 300000 ? 1 :
                          student.parentDetails?.annualIncome < 500000 ? 0.7 : 0.3;
      
      const eligibilityScore = (avgPercentage * 0.6) + (incomeFactor * 40);
      const isEligible = eligibilityScore >= 60;
      
      let scholarshipPercent = 0;
      if (eligibilityScore >= 90) scholarshipPercent = 50;
      else if (eligibilityScore >= 80) scholarshipPercent = 40;
      else if (eligibilityScore >= 70) scholarshipPercent = 30;
      else if (eligibilityScore >= 60) scholarshipPercent = 20;
      
      return `🎓 Scholarship Eligibility Check:\n\n📊 Academic Score: ${avgPercentage.toFixed(1)}%\n💰 Income Factor: ${incomeFactor * 100}%\n📈 Eligibility Score: ${eligibilityScore.toFixed(1)}%\n${isEligible ? '✅ You ARE eligible for scholarship!' : '❌ You are NOT eligible currently.'}\n\n${isEligible ? `🎯 You qualify for ${scholarshipPercent}% scholarship!\n💰 Scholarship Amount: ₹${(student.fees.total * scholarshipPercent / 100).toFixed(2)}` : '💡 Focus on improving grades to become eligible.'}`;
    }
    return "Scholarship information is available for students only.";
  }
  
  async handleCalculation(message) {
    // Extract numbers and operations
    const numbers = message.match(/\d+(?:\.\d+)?/g) || [];
    const operations = message.match(/[+\-*/%]/g) || [];
    
    if (numbers.length >= 2 && operations.length >= 1) {
      try {
        let result = parseFloat(numbers[0]);
        for (let i = 0; i < operations.length && i + 1 < numbers.length; i++) {
          const num = parseFloat(numbers[i + 1]);
          switch(operations[i]) {
            case '+': result += num; break;
            case '-': result -= num; break;
            case '*': result *= num; break;
            case '/': result /= num; break;
            case '%': result %= num; break;
          }
        }
        return `🧮 Calculation Result: ${result.toFixed(2)}\n\n📝 ${numbers.join(' ' + operations[0] + ' ')} = ${result.toFixed(2)}`;
      } catch(e) {
        return "I couldn't perform that calculation. Please use numbers and operators like +, -, *, /, %";
      }
    }
    
    return "Please specify what you'd like to calculate (attendance projection, salary after leave, fees with scholarship, etc.)";
  }
  
  getDefaultResponse() {
    return `🤖 Hello! I'm your AI Assistant. I can help you with:\n\n📊 Attendance (current or projection)\n💰 Salary details and calculations\n💵 Fees and payment status\n📚 Marks, results, and CGPA\n🎓 Scholarship eligibility\n🧮 Any calculations\n\nJust ask me anything! Example:\n• "What's my attendance percentage?"\n• "Calculate my salary if I take 3 leaves"\n• "Am I eligible for scholarship?"\n• "What if I attend 5 more days?"`;
  }
}

module.exports = ChatbotAI;