import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import HRDashboard from './components/Dashboard/HRDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Home from './pages/Home';
import About from './pages/About';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import TourGuide from './components/TourGuide';
import './App.css';

// Dynamic Title Component
const DynamicTitle = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
};

// Navbar Component
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showTour, setShowTour] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  const isActive = (path) => location.pathname === path;
  
  // Set favicon based on role
  useEffect(() => {
    if (user?.role) {
      const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
      favicon.type = 'image/x-icon';
      favicon.rel = 'shortcut icon';
      if (user.role === 'student') favicon.href = '/favicon-student.ico';
      else if (user.role === 'teacher') favicon.href = '/favicon-teacher.ico';
      else if (user.role === 'hr') favicon.href = '/favicon-hr.ico';
      else if (user.role === 'admin') favicon.href = '/favicon-admin.ico';
      document.head.appendChild(favicon);
    }
  }, [user.role]);
  
  return (
    <>
      <DynamicTitle title={location.pathname === '/' ? 'Home | SMS' : 
                           location.pathname === '/about' ? 'About | SMS' :
                           location.pathname.includes('dashboard') ? `${user.role?.toUpperCase()} Dashboard | SMS` :
                           'Student Management System'} />
      <motion.nav 
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <div className="logo-icon">🎓</div>
            <span className="logo-text">SMS</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
            {token && user.role && (
              <Link to={`/dashboard/${user.role}`} className={`nav-link ${isActive(`/dashboard/${user.role}`) ? 'active' : ''}`}>
                Dashboard
              </Link>
            )}
          </div>
          
          <div className="nav-actions">
            {token ? (
              <>
                {user.role && (
                  <button className="tour-btn-small" onClick={() => setShowTour(true)}>
                    🗺️ Tour
                  </button>
                )}
                <motion.button 
                  className="nav-btn logout"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>👤 {user.name?.split(' ')[0]}</span>
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <Link to="/login">
                <motion.button 
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                  <span>→</span>
                </motion.button>
              </Link>
                          )}
          </div>
        </div>
      </motion.nav>
      {showTour && <TourGuide onClose={() => setShowTour(false)} role={user.role} />}
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-ring"></div>
          <div className="loading-text">Initializing System...</div>
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="App">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/student" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/teacher" element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/hr" element={
              <ProtectedRoute role="hr">
                <HRDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;