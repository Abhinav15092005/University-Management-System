import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const features = [
    { icon: '📊', title: 'Real-time Analytics', desc: 'Live attendance tracking and performance metrics with AI insights' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Smart chatbot for calculations, projections, and instant answers' },
    { icon: '📚', title: 'Result Management', desc: 'PDF generation, grade analysis, and performance tracking' },
    { icon: '💰', title: 'Fee Management', desc: 'Scholarship calculation and payment tracking with alerts' },
    { icon: '👥', title: 'Multi-role Portal', desc: 'Student, Teacher, HR, and Admin interfaces with unique features' },
    { icon: '📱', title: 'Fully Responsive', desc: 'Works perfectly on all devices - mobile, tablet, desktop, TV' },
    { icon: '🔐', title: 'Secure Authentication', desc: 'JWT tokens, role-based access, and encrypted passwords' },
    { icon: '📈', title: 'Performance Analytics', desc: 'CGPA calculation, subject-wise analysis, and trend graphs' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span>⚡ Next Generation Education Platform</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Transform Your
              <span className="gradient-text"> Educational Experience</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              The most advanced Student Management System with AI-powered analytics,
              real-time tracking, and seamless communication between all stakeholders.
            </motion.p>
            
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/login">
                <motion.button 
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free
                  <span>→</span>
                </motion.button>
              </Link>
              <a href="#features">
                <motion.button 
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </a>
            </motion.div>
            
            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Teachers</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-badge">Why Choose Us</span>
          <h2>Powerful Features for Modern Education</h2>
          <p>Everything you need to manage educational institutions efficiently</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <span className="section-badge">Simple Process</span>
          <h2>How It Works</h2>
          <p>Get started in just a few simple steps</p>
        </div>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Register Account</h3>
            <p>Sign up as Student, Teacher, or HR staff</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Complete Profile</h3>
            <p>Add your personal and academic details</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Explore Dashboard</h3>
            <p>View attendance, results, fees, and more</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Use AI Assistant</h3>
            <p>Get instant answers and calculations</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Ready to Revolutionize Your Institution?</h2>
            <p>Join thousands of educational institutions already using our platform</p>
            <Link to="/login">
              <motion.button 
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey Today
                <span>→</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;