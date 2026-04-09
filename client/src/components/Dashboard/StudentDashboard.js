import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const profileRes = await axios.get('http://localhost:5000/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentData(profileRes.data.student);
      
      const attendanceRes = await axios.get(`http://localhost:5000/api/attendance/student/${profileRes.data.student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceStats(attendanceRes.data.stats);
      setAttendanceTrend(attendanceRes.data.trend || []);
      
      const resultsRes = await axios.get(`http://localhost:5000/api/results/student/${profileRes.data.student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(resultsRes.data.results || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
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
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <div className="avatar">
            <span>{user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h1>Welcome, {user?.fullName || user?.name}</h1>
            <p>University ID: {studentData?.universityId || studentData?.enrollmentNo} | Course: {studentData?.course} | Semester: {studentData?.currentSemester || studentData?.semester}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">ATTENDANCE</div>
          <div className="stat-info">
            <h3>Attendance Rate</h3>
            <div className="stat-value">{attendanceStats?.percentage || 0}%</div>
            <p>Current Month</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">ACADEMIC</div>
          <div className="stat-info">
            <h3>CGPA</h3>
            <div className="stat-value">
              {results.length > 0 ? (results.reduce((sum, r) => sum + (r.percentage / 10), 0) / results.length).toFixed(2) : 'N/A'}
            </div>
            <p>Overall Performance</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">FINANCE</div>
          <div className="stat-info">
            <h3>Fee Status</h3>
            <div className="stat-value">₹{studentData?.fees?.pending?.toLocaleString() || 0}</div>
            <p>Pending Payment</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">COURSES</div>
          <div className="stat-info">
            <h3>Active Courses</h3>
            <div className="stat-value">{results[0]?.subjects?.length || 6}</div>
            <p>Current Semester</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
        <button className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>Results</button>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tab-content">
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-card" onClick={() => window.open('/results', '_blank')}>View Results</button>
                <button className="action-card" onClick={() => alert('Scholarship application section')}>Apply Scholarship</button>
                <button className="action-card" onClick={() => alert('Leave request section')}>Request Leave</button>
                <button className="action-card" onClick={() => alert('Fee payment section')}>Pay Fees</button>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'attendance' && (
          <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tab-content">
            <div className="attendance-details">
              <div className="attendance-summary">
                <h3>Monthly Attendance Summary</h3>
                <div className="summary-stats">
                  <div className="summary-stat"><span className="stat-label">Total Days</span><span className="stat-number">{attendanceStats?.totalDays || 0}</span></div>
                  <div className="summary-stat"><span className="stat-label">Present</span><span className="stat-number success">{attendanceStats?.present || 0}</span></div>
                  <div className="summary-stat"><span className="stat-label">Absent</span><span className="stat-number danger">{attendanceStats?.absent || 0}</span></div>
                  <div className="summary-stat"><span className="stat-label">Late</span><span className="stat-number warning">{attendanceStats?.late || 0}</span></div>
                </div>
              </div>
              
              <div className="attendance-timeline">
                <h3>Recent Attendance</h3>
                <div className="timeline-grid">
                  {attendanceTrend.map((day, idx) => (
                    <div key={idx} className={`timeline-day ${day.status}`}>
                      <span className="day-name">{day.date}</span>
                      <span className="day-status">{day.status === 'present' ? 'P' : day.status === 'late' ? 'L' : 'A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'results' && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tab-content">
            {results.length > 0 ? (
              <div className="results-list">
                <h3>Exam Results</h3>
                {results.map((result, idx) => (
                  <div key={idx} className="result-card">
                    <div className="result-header">
                      <h4>{result.examType.toUpperCase()} - Semester {result.semester}</h4>
                      <span className={`result-badge ${result.result}`}>{result.result.toUpperCase()}</span>
                    </div>
                    <div className="result-stats">
                      <span>Percentage: {result.percentage.toFixed(2)}%</span>
                      <span>Date: {new Date(result.declaredDate).toLocaleDateString()}</span>
                    </div>
                    <button className="view-details-btn" onClick={() => alert(`Percentage: ${result.percentage.toFixed(2)}%\nResult: ${result.result.toUpperCase()}`)}>View Details</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data"><p>No results available.</p></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;