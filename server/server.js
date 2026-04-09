const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const hrRoutes = require('./routes/hr');
const adminRoutes = require('./routes/admin');
const attendanceRoutes = require('./routes/attendance');
const resultRoutes = require('./routes/results');
const chatbotRoutes = require('./routes/chatbot');

// Import services
const BackupService = require('./services/backupService');
const AutoUpdateService = require('./services/autoUpdateService');

let backupService = null;
let autoUpdateService = null;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sms';

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // ============================================
  // FIRST TIME SETUP - DISABLED
  // Use Excel import to add users instead
  // ============================================
  // const firstTimeSetup = require('./scripts/firstTimeSetup');
  // await firstTimeSetup();
  
  // Initialize services ONLY after MongoDB is connected
  backupService = new BackupService();
  autoUpdateService = new AutoUpdateService();
  
  // Start auto-backup (every 24 hours) - wait 30 seconds before first backup
  setTimeout(async () => {
    console.log('Starting auto-backup service...');
    await backupService.scheduleAutoBackup();
  }, 30000);
  
  // Start auto-updates - wait 1 minute before first update
  setTimeout(async () => {
    console.log('Starting auto-update service...');
    await autoUpdateService.scheduleUpdates();
  }, 60000);
  
  console.log('✅ Auto-backup and auto-update services initialized');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Services will start when MongoDB connects...');
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Student Management System API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 http://localhost:${PORT}`);
  console.log('⏳ Waiting for MongoDB connection...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (backupService) {
    console.log('Creating final backup before shutdown...');
    await backupService.createFullBackup();
  }
  await mongoose.disconnect();
  process.exit(0);
});