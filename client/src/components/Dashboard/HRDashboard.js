import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const HRDashboard = () => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '123456',
    role: 'student',
    course: '',
    department: '',
    designation: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchAllUsers(token);
  }, [navigate]);

  const fetchAllUsers = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/hr/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/hr/add-user', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User added successfully!');
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '123456', role: 'student', course: '', department: '', designation: '' });
      fetchAllUsers(token);
    } catch (error) {
      alert('Error adding user: ' + (error.response?.data?.error || 'Unknown error'));
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
          <p>Loading HR dashboard...</p>
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
              <h1>Welcome, {user?.name}</h1>
              <p>HR Department | System Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn-glow">Logout</button>
        </motion.div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card-glow">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{allUsers.length}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <h3>Students</h3>
            <div className="stat-value">{allUsers.filter(u => u.role === 'student').length}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>Teachers</h3>
            <div className="stat-value">{allUsers.filter(u => u.role === 'teacher').length}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>HR Staff</h3>
            <div className="stat-value">{allUsers.filter(u => u.role === 'hr').length}</div>
          </div>
        </div>
      </div>
      
      <div className="quick-actions" style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowAddForm(!showAddForm)} className="action-card" style={{ background: '#667eea', color: 'white' }}>
          <span>➕</span>
          <p>Add New User</p>
        </button>
      </div>
      
      {showAddForm && (
        <div className="attendance-summary" style={{ marginBottom: '20px' }}>
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: 'white' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: 'white' }}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: 'white' }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="hr">HR</option>
            </select>
            {formData.role === 'student' && (
              <input
                type="text"
                placeholder="Course"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                required
                style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: 'white' }}
              />
            )}
            {formData.role === 'teacher' && (
              <>
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: 'white' }}
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: 'white' }}
                />
              </>
            )}
            <button type="submit" style={{ padding: '12px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Add User
            </button>
          </form>
        </div>
      )}
      
      <div className="results-list">
        <h3>All Users</h3>
        {allUsers.map((user, idx) => (
          <div key={idx} className="result-card">
            <div className="result-header">
              <h4>{user.name}</h4>
              <span className={`result-badge ${user.role === 'student' ? 'pass' : user.role === 'teacher' ? 'warning' : 'success'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <div className="result-stats">
              <span>Email: {user.email}</span>
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRDashboard;