const mongoose = require('mongoose');
const dotenv = require('dotenv');
const seedDatabase = require('./config/seeder');
const seedAttendance = require('./config/attendanceSeeder');

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing Database...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Run seeders
    await seedDatabase();
    await seedAttendance();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database initialization complete!');
    console.log('You can now start the server with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();