import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TourGuide.css';

const TourGuide = ({ onClose, role }) => {
  const [step, setStep] = useState(0);
  
  const tours = {
    student: [
      { element: '.stats-grid', title: 'Statistics Overview', content: 'View your attendance percentage, CGPA, fees status at a glance.' },
      { element: '.dashboard-tabs', title: 'Dashboard Tabs', content: 'Switch between Overview, Attendance, Results, and Schedule.' },
      { element: '.charts-grid', title: 'Performance Charts', content: 'See your attendance trends and performance analytics visually.' },
      { element: '.quick-actions', title: 'Quick Actions', content: 'Access results, scholarship applications, leave requests, and fee payment.' },
      { element: '.chatbot-toggle', title: 'AI Assistant', content: 'Ask anything about attendance, fees, results, or calculations.' }
    ],
    teacher: [
      { element: '.stats-grid', title: 'Teacher Stats', content: 'View your students count, salary, subjects, and leave balance.' },
      { element: '.dashboard-tabs', title: 'Teacher Actions', content: 'View students list and mark attendance easily.' },
      { element: '.results-list', title: 'Student List', content: 'See all your assigned students with their details.' },
      { element: '.action-buttons', title: 'Mark Attendance', content: 'Mark students as Present, Absent, or Late instantly.' },
      { element: '.chatbot-toggle', title: 'AI Assistant', content: 'Calculate salary projections, leave deductions, and more.' }
    ],
    hr: [
      { element: '.stats-grid', title: 'HR Overview', content: 'See total users, students, teachers, and HR staff count.' },
      { element: '.quick-actions', title: 'Add Users', content: 'Add new students or teachers to the system.' },
      { element: '.results-list', title: 'User Management', content: 'View all users and manage their details.' },
      { element: '.chatbot-toggle', title: 'AI Assistant', content: 'Get help with user management and system stats.' }
    ],
    admin: [
      { element: '.stats-grid', title: 'Admin Overview', content: 'Complete system statistics at your fingertips.' },
      { element: '.admin-actions', title: 'System Control', content: 'Manage all users, courses, departments, and settings.' },
      { element: '.user-management', title: 'Full Control', content: 'Edit, delete, or modify any user in the system.' },
      { element: '.chatbot-toggle', title: 'AI Assistant', content: 'Get admin insights and system recommendations.' }
    ]
  };
  
  const currentTour = tours[role] || tours.student;
  
  const scrollToElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.transition = 'all 0.3s';
      element.style.boxShadow = '0 0 0 4px #667eea';
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 1000);
    }
  };
  
  useEffect(() => {
    if (currentTour[step]) {
      scrollToElement(currentTour[step].element);
    }
  }, [step, currentTour]);
  
  const nextStep = () => {
    if (step < currentTour.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const skipTour = () => {
    onClose();
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="tour-card"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
        >
          <div className="tour-header">
            <h3>📖 System Tour</h3>
            <button className="tour-close" onClick={skipTour}>✕</button>
          </div>
          
          <div className="tour-content">
            <div className="tour-step-indicator">
              Step {step + 1} of {currentTour.length}
            </div>
            <h4>{currentTour[step]?.title}</h4>
            <p>{currentTour[step]?.content}</p>
          </div>
          
          <div className="tour-actions">
            <button className="tour-btn-skip" onClick={skipTour}>Skip Tour</button>
            <div>
              {step > 0 && (
                <button className="tour-btn-prev" onClick={prevStep}>Previous</button>
              )}
              <button className="tour-btn-next" onClick={nextStep}>
                {step === currentTour.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TourGuide;