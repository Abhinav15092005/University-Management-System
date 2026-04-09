import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  const openLinkedIn = () => {
    window.open('https://www.linkedin.com/in/aryan-bakshi-84604a317/', '_blank');
  };

  return (
    <div className="about">
      <section className="about-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="about-hero-content"
        >
          <h1>About Student Management System</h1>
          <p>Revolutionizing education through technology and innovation</p>
        </motion.div>
      </section>
      
      <section className="about-mission">
        <div className="mission-grid">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mission-card"
          >
            <div className="mission-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>To empower educational institutions with cutting-edge technology that streamlines operations, enhances learning outcomes, and fosters seamless communication between all stakeholders.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mission-card"
          >
            <div className="mission-icon">👁️</div>
            <h3>Our Vision</h3>
            <p>To become the world's leading education management platform, transforming how institutions operate and students learn through intelligent, AI-powered solutions.</p>
          </motion.div>
        </div>
      </section>
      
      <section className="about-values">
        <div className="values-header">
          <h2>Our Core Values</h2>
          <p>Guiding principles that drive everything we do</p>
        </div>
        
        <div className="values-grid">
          {[
            { title: 'Innovation', desc: 'Constantly pushing boundaries to deliver cutting-edge solutions' },
            { title: 'Excellence', desc: 'Committed to delivering the highest quality experience' },
            { title: 'Integrity', desc: 'Transparent, ethical, and trustworthy in all we do' },
            { title: 'Collaboration', desc: 'Working together to achieve greater outcomes' }
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="value-card"
            >
              <h3>{value.title}</h3>
              <p>{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      <section className="about-creator">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="creator-card"
          onClick={openLinkedIn}
          style={{ cursor: 'pointer' }}
        >
          <div className="creator-avatar">👨‍💻</div>
          <h3>Aryan Bakshi</h3>
          <p>B.Tech AIML • CGC University, Mohali</p>
          <p className="creator-role">Creator & Lead Developer</p>
          <div className="linkedin-badge">
            <span>🔗</span> Connect on LinkedIn
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;