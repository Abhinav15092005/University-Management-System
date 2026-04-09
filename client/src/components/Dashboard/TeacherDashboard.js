import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchTeacherData(token);
  }, [navigate]);

  const fetchTeacherData = async (token) => {
    try {
      const teacherRes = await axios.get('http://localhost:5000/api/teacher/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeacher(teacherRes.data.teacher);
      
      const studentsRes = await axios.get('http://localhost:5000/api/teacher/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(studentsRes.data.students);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/mark', 
        { studentId, status, subject: teacher?.subjects?.[0] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Attendance marked successfully!');
      // Refresh data
      fetchTeacherData(token);
    } catch (error) {
      alert('Error marking attendance');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen-custom">
          <div className="spinner"></div>
          <p>Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-glow">
        <motion.div 
          className="dashboard-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="header-info">
            <div className="avatar">
              <span>{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <h1>Welcome, Prof. {user?.name}</h1>
              <p>Department: {teacher?.department} | Designation: {teacher?.designation}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn-glow">Logout</button>
        </motion.div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card-glow">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <div className="stat-value">{students.length}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Monthly Salary</h3>
            <div className="stat-value">₹{teacher?.salary?.netSalary?.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Subjects</h3>
            <div className="stat-value">{teacher?.subjects?.length || 3}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">🏖️</div>
          <div className="stat-info">
            <h3>Leaves Left</h3>
            <div className="stat-value">{teacher?.leaves?.remaining || 20}</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          Students
        </button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          Mark Attendance
        </button>
        <button className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>
          Salary Details
        </button>
      </div>
      
      {activeTab === 'students' && (
        <div className="tab-content">
          <div className="results-list">
            <h3>Your Students</h3>
            {students.map((student, idx) => (
              <div key={idx} className="result-card">
                <div className="result-header">
                  <h4>{student.name}</h4>
                  <span className="result-badge pass">Enrollment: {student.enrollmentNo}</span>
                </div>
                <div className="result-stats">
                  <span>Course: {student.course}</span>
                  <span>Semester: {student.semester}</span>
                  <span>Attendance: {student.monthlyPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'attendance' && (
        <div className="tab-content">
          <div className="results-list">
            <h3>Mark Today's Attendance</h3>
            {students.map((student, idx) => (
              <div key={idx} className="result-card">
                <div className="result-header">
                  <h4>{student.name}</h4>
                  <span className="result-badge pass">{student.enrollmentNo}</span>
                </div>
                <div className="action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => markAttendance(student.id, 'present')} className="action-card" style={{ background: '#48bb78' }}>
                    Present ✅
                  </button>
                  <button onClick={() => markAttendance(student.id, 'absent')} className="action-card" style={{ background: '#f56565' }}>
                    Absent ❌
                  </button>
                  <button onClick={() => markAttendance(student.id, 'late')} className="action-card" style={{ background: '#ed8936' }}>
                    Late ⚠️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'salary' && (
        <div className="tab-content">
          <div className="attendance-details">
            <div className="attendance-summary">
              <h3>Salary Breakdown</h3>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Basic Salary</span>
                  <span className="stat-number">₹{teacher?.salary?.basic?.toLocaleString()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Allowances</span>
                  <span className="stat-number success">+₹{teacher?.salary?.allowances?.toLocaleString()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Deductions</span>
                  <span className="stat-number danger">-₹{teacher?.salary?.deductions?.toLocaleString()}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Net Salary</span>
                  <span className="stat-number" style={{ color: '#667eea' }}>₹{teacher?.salary?.netSalary?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="attendance-timeline">
              <h3>Leave Summary</h3>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Total Leaves</span>
                  <span className="stat-number">{teacher?.leaves?.total}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Used</span>
                  <span className="stat-number warning">{teacher?.leaves?.used}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Remaining</span>
                  <span className="stat-number success">{teacher?.leaves?.remaining}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;