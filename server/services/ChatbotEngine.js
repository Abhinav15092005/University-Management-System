class ChatbotEngine {
  constructor(userData, db) {
    this.user = userData.user;
    this.role = userData.role;
    this.db = db;
    this.context = {};
    this.intentPatterns = {
      attendance: /(attendance|present|absent|percentage|how many days)/i,
      salary: /(salary|payment|pay|earning|deduction)/i,
      fees: /(fees|fee|payment|dues|scholarship discount)/i,
      marks: /(marks|grade|result|score|performance)/i,
      leave: /(leave|holiday|time off|vacation)/i,
      scholarship: /(scholarship|financial aid|assistantship)/i,
      calculation: /(calculate|compute|how much|total|sum|average)/i,
      attendanceProjection: /(if I attend|will my attendance|projection)/i,
      salaryProjection: /(if.*leave|salary after|deduction)/i
    };
  }

  async processMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    // Check for calculation requests first
    if (lowerMsg.includes('calculate') || lowerMsg.includes('compute') || 
        lowerMsg.includes('how much') || lowerMsg.includes('total')) {
      return await this.handleCalculation(message);
    }
    
    // Match intent
    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(lowerMsg)) {
        return await this.handleIntent(intent, message);
      }
    }
    
    return this.getDefaultResponse();
  }

  async handleIntent(intent, message) {
    switch(intent) {
      case 'attendance':
        return await this.getAttendanceInfo();
      case 'attendanceProjection':
        return await this.projectAttendance(message);
      case 'salary':
        return await this.getSalaryInfo();
      case 'salaryProjection':
        return await this.projectSalary(message);
      case 'fees':
        return await this.getFeesInfo();
      case 'marks':
        return await this.getMarksInfo();
      case 'leave':
        return await this.getLeaveInfo();
      case 'scholarship':
        return await this.getScholarshipInfo();
      default:
        return this.getDefaultResponse();
    }
  }

  async handleCalculation(message) {
    // Extract numbers and operations using regex
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
        return `Calculation result: ${result.toFixed(2)}`;
      } catch(e) {
        return "I couldn't perform that calculation. Please use numbers and operators like +, -, *, /, %";
      }
    }
    
    // Check if it's attendance calculation
    if (message.toLowerCase().includes('attendance')) {
      return await this.calculateAttendanceImpact(message);
    }
    
    // Check if it's salary calculation
    if (message.toLowerCase().includes('salary')) {
      return await this.calculateSalaryImpact(message);
    }
    
    return "Please specify what you'd like to calculate (attendance, salary, fees, etc.)";
  }

  async getAttendanceInfo() {
    if (this.role === 'student') {
      const Attendance = this.db.model('Attendance');
      const Student = this.db.model('Student');
      
      const student = await Student.findOne({ userId: this.user._id });
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const attendance = await Attendance.find({
        userId: this.user._id,
        date: { $gte: startOfMonth }
      });
      
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return `Your attendance this month: ${presentDays}/${totalDays} days (${percentage.toFixed(1)}%). ${percentage < 75 ? '⚠️ You need to improve attendance!' : '✅ Good job maintaining attendance!'}`;
    }
    return "Attendance information is available in your dashboard.";
  }

  async projectAttendance(message) {
    if (this.role === 'student') {
      const numbers = message.match(/\d+/g);
      if (numbers && numbers.length >= 1) {
        const daysToAttend = parseInt(numbers[0]);
        const Attendance = this.db.model('Attendance');
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        const attendance = await Attendance.find({
          userId: this.user._id,
          date: { $gte: startOfMonth }
        });
        
        const totalDaysSoFar = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const remainingDays = 30 - totalDaysSoFar;
        
        if (daysToAttend <= remainingDays) {
          const newTotal = totalDaysSoFar + daysToAttend;
          const newPresent = presentDays + daysToAttend;
          const newPercentage = (newPresent / newTotal) * 100;
          return `If you attend next ${daysToAttend} days, your attendance will be ${newPercentage.toFixed(1)}%. ${newPercentage >= 75 ? '✅ You will meet the 75% requirement!' : '⚠️ You will still be below 75%.'}`;
        }
        return `You can only attend ${remainingDays} more days this month.`;
      }
      return "Please specify how many days you plan to attend. Example: 'What will be my attendance if I attend 10 more days?'";
    }
    return "This feature is available for students only.";
  }

  async getSalaryInfo() {
    if (this.role === 'teacher') {
      const Teacher = this.db.model('Teacher');
      const teacher = await Teacher.findOne({ userId: this.user._id });
      
      if (teacher) {
        const leaveDeduction = (teacher.salary.basic / 30) * teacher.leaves.used;
        const netSalary = teacher.salary.netSalary - leaveDeduction;
        
        return `Your salary details:
        • Basic: ₹${teacher.salary.basic}
        • Allowances: ₹${teacher.salary.allowances}
        • Deductions: ₹${teacher.salary.deductions}
        • Leave deduction: ₹${leaveDeduction.toFixed(2)}
        • Net Salary: ₹${netSalary.toFixed(2)}
        
        Used leaves: ${teacher.leaves.used}/${teacher.leaves.total}`;
      }
    }
    return "Salary information is available in your profile section.";
  }

  async calculateSalaryImpact(message) {
    if (this.role === 'teacher') {
      const numbers = message.match(/\d+/g);
      if (numbers && numbers.length >= 1) {
        const daysOff = parseInt(numbers[0]);
        const Teacher = this.db.model('Teacher');
        const teacher = await Teacher.findOne({ userId: this.user._id });
        
        if (teacher) {
          const perDaySalary = teacher.salary.basic / 30;
          const deduction = perDaySalary * daysOff;
          const newSalary = teacher.salary.netSalary - deduction;
          
          return `If you take ${daysOff} day(s) off, your salary deduction would be ₹${deduction.toFixed(2)}, making your salary ₹${newSalary.toFixed(2)}.`;
        }
      }
      return "Please specify number of leave days. Example: 'Calculate salary if I take 3 days leave'";
    }
    return "This feature is for teachers only.";
  }

  async getFeesInfo() {
    if (this.role === 'student') {
      const Student = this.db.model('Student');
      const student = await Student.findOne({ userId: this.user._id });
      
      if (student) {
        const pendingAfterScholarship = student.fees.pending - student.fees.scholarshipDiscount;
        return `Your fees details:
        • Total Fees: ₹${student.fees.total}
        • Paid: ₹${student.fees.paid}
        • Pending: ₹${student.fees.pending}
        • Scholarship Discount: ₹${student.fees.scholarshipDiscount}
        • Net Payable: ₹${pendingAfterScholarship}
        
        ${student.scholarshipStatus === 'approved' ? '🎓 Scholarship Approved!' : '💡 You can apply for scholarship if eligible.'}`;
      }
    }
    return "Fee details are available in your dashboard.";
  }

  async getMarksInfo() {
    if (this.role === 'student') {
      const Result = this.db.model('Result');
      const Student = this.db.model('Student');
      const student = await Student.findOne({ userId: this.user._id });
      
      const results = await Result.find({ studentId: student._id })
        .sort({ semester: -1, declaredDate: -1 })
        .limit(3);
      
      if (results.length > 0) {
        let response = "Your recent results:\n";
        results.forEach(result => {
          response += `• ${result.examType.toUpperCase()} - Sem ${result.semester}: ${result.percentage.toFixed(1)}% (${result.result})\n`;
        });
        return response;
      }
      return "No results available yet.";
    }
    return "Results are available in your dashboard.";
  }

  async getScholarshipInfo() {
    if (this.role === 'student') {
      const Scholarship = this.db.model('Scholarship');
      const Student = this.db.model('Student');
      const student = await Student.findOne({ userId: this.user._id });
      
      const scholarship = await Scholarship.findOne({ studentId: student._id });
      
      if (scholarship) {
        return `Scholarship Status: ${scholarship.status.toUpperCase()}
        • Type: ${scholarship.scholarshipType}
        • Percentage: ${scholarship.percentageAwarded}%
        • Award: ₹${(student.fees.total * scholarship.percentageAwarded / 100).toFixed(2)}
        ${scholarship.status === 'approved' ? '✅ Congratulations! Scholarship approved.' : '⏳ Application under review.'}`;
      }
      
      // Check eligibility
      const eligibility = await this.checkScholarshipEligibility(student);
      if (eligibility.eligible) {
        return `You are eligible for scholarship! Apply now from the scholarship section. Your eligibility score: ${eligibility.score}`;
      }
      return "You are not currently eligible for scholarship. Focus on improving academic performance.";
    }
    return "Scholarship information is available for students only.";
  }

  async checkScholarshipEligibility(student) {
    const Result = this.db.model('Result');
    const results = await Result.find({ studentId: student._id })
      .sort({ semester: -1 })
      .limit(2);
    
    const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / (results.length || 1);
    const eligibilityScore = (avgPercentage * 0.6) + ((1 - (student.fees.pending / student.fees.total)) * 0.4);
    
    return {
      eligible: avgPercentage >= 75 || student.parentDetails.annualIncome < 300000,
      score: eligibilityScore
    };
  }

  async getLeaveInfo() {
    if (this.role === 'teacher') {
      const Teacher = this.db.model('Teacher');
      const teacher = await Teacher.findOne({ userId: this.user._id });
      return `Leave balance: ${teacher.leaves.remaining} days remaining out of ${teacher.leaves.total}. Used: ${teacher.leaves.used} days.`;
    } else if (this.role === 'student') {
      const Leave = this.db.model('Leave');
      const leaves = await Leave.find({ 
        userId: this.user._id,
        status: 'approved'
      });
      const totalDays = leaves.reduce((sum, leave) => {
        const days = (leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24) + 1;
        return sum + days;
      }, 0);
      return `You have taken ${totalDays} leave days this academic year. Maximum allowed: 15 days.`;
    }
    return "Leave information is available in your profile.";
  }

  getDefaultResponse() {
    const suggestions = [
      "You can ask me about:",
      "• Attendance (current or projection)",
      "• Salary details and calculations",
      "• Fees and payment status",
      "• Marks and results",
      "• Scholarship eligibility",
      "• Leave balance",
      "• Perform calculations (e.g., 'Calculate 500 + 300')"
    ];
    return suggestions.join("\n");
  }
}

module.exports = ChatbotEngine;