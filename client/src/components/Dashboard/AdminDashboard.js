import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(userData);
    fetchAllData(token);
  }, [navigate]);

  const fetchAllData = async (token) => {
    try {
      const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(usersRes.data.users);
      
      const studentsRes = await axios.get('http://localhost:5000/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllStudents(studentsRes.data.students);
      
      const teachersRes = await axios.get('http://localhost:5000/api/admin/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTeachers(teachersRes.data.teachers);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchAllData(token);
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/user/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User updated successfully');
      setEditingUser(null);
      fetchAllData(token);
    } catch (error) {
      alert('Error updating user');
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
          <p>Loading admin dashboard...</p>
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
              <h1>Welcome, Admin {user?.name}</h1>
              <p>System Administrator | Full Control</p>
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
            <div className="stat-value">{allStudents.length}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>Teachers</h3>
            <div className="stat-value">{allTeachers.length}</div>
          </div>
        </div>
        
        <div className="stat-card-glow">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>Departments</h3>
            <div className="stat-value">{new Set(allTeachers.map(t => t.department)).size}</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          All Users
        </button>
        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          Students
        </button>
        <button className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
          Teachers
        </button>
      </div>
      
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="results-list">
            <h3>System Users ({allUsers.length})</h3>
            {allUsers.map((user, idx) => (
              <div key={idx} className="result-card">
                {editingUser === user._id ? (
                  <EditUserForm user={user} onSave={updateUser} onCancel={() => setEditingUser(null)} />
                ) : (
                  <>
                    <div className="result-header">
                      <h4>{user.name}</h4>
                      <span className={`result-badge ${user.role === 'admin' ? 'success' : user.role === 'teacher' ? 'warning' : 'pass'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="result-stats">
                      <span>📧 {user.email}</span>
                      <span>📅 Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => setEditingUser(user._id)} className="action-card" style={{ background: '#4299e1' }}>
                        Edit ✏️
                      </button>
                      <button onClick={() => deleteUser(user._id)} className="action-card" style={{ background: '#f56565' }}>
                        Delete 🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'students' && (
        <div className="tab-content">
          <div className="results-list">
            <h3>All Students ({allStudents.length})</h3>
            {allStudents.map((student, idx) => (
              <div key={idx} className="result-card">
                <div className="result-header">
                  <h4>{student.userId?.name || 'Unknown'}</h4>
                  <span className="result-badge pass">Enrollment: {student.enrollmentNo}</span>
                </div>
                <div className="result-stats">
                  <span>📚 Course: {student.course}</span>
                  <span>📖 Semester: {student.semester}</span>
                  <span>💰 Fees: ₹{student.fees?.pending?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'teachers' && (
        <div className="tab-content">
          <div className="results-list">
            <h3>All Teachers ({allTeachers.length})</h3>
            {allTeachers.map((teacher, idx) => (
              <div key={idx} className="result-card">
                <div className="result-header">
                  <h4>{teacher.userId?.name || 'Unknown'}</h4>
                  <span className="result-badge warning">ID: {teacher.employeeId}</span>
                </div>
                <div className="result-stats">
                  <span>🏛️ Dept: {teacher.department}</span>
                  <span>💼 Designation: {teacher.designation}</span>
                  <span>💰 Salary: ₹{teacher.salary?.netSalary?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Edit User Form Component
const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, formData);
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="hr">HR</option>
        <option value="admin">Admin</option>
      </select>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ background: '#48bb78', padding: '8px 15px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
          Save
        </button>
        <button type="button" onClick={onCancel} style={{ background: '#f56565', padding: '8px 15px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;