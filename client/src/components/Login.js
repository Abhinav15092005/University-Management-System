import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on role
        if (response.data.user.role === 'student') {
          navigate('/dashboard/student');
        } else if (response.data.user.role === 'teacher') {
          navigate('/dashboard/teacher');
        } else if (response.data.user.role === 'hr') {
          navigate('/dashboard/hr');
        } else if (response.data.user.role === 'admin') {
          navigate('/dashboard/admin');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>University Management System</h2>
          <p>Login to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Personal Email or University Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>
        
        <div className="contact-support">
          <p>Contact IT Support for account access</p>
          <p className="support-email">support@university.edu</p>
        </div>
      </div>
    </div>
  );
};

export default Login;