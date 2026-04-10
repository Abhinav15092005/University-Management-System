# 🎓 University Management System

A comprehensive, production-ready University Management System with multi-role support (Student, Teacher, HR, Admin), AI-powered chatbot, Excel import/export, auto-backup, and real-time analytics.

## ✨ Features

### 👨‍🎓 Student Portal
- Real-time attendance tracking with charts
- Exam results and CGPA calculation
- Fee management with scholarship support
- Class schedule viewer
- AI chatbot for queries and calculations
- Download result PDFs

### 👨‍🏫 Teacher Portal
- Mark student attendance (Present/Absent/Late)
- View assigned students
- Salary details and leave management
- Student performance analytics

### 🏢 HR Portal
- Add/Manage students and teachers
- Import users via Excel
- View all system users
- Generate reports

### 👑 Admin Portal
- Complete system control
- User management (Edit/Delete any user)
- Excel import/export
- Database backup and restore
- System statistics and health monitoring

### 🤖 AI Chatbot
- Attendance predictions
- Salary calculations
- Fee projections with scholarships
- Result analysis
- CGPA calculations
- Mathematical computations
- Works on EVERY page after login

### 📊 Additional Features
- Auto-backup every 24 hours
- Semester progression automation
- Attendance recalculation
- Performance predictions
- Excel import/export (Multi-sheet support)
- Responsive design (Mobile, Tablet, Desktop, TV)
- Dark professional theme
- JWT authentication
- Role-based access control

## 🚀 Quick Start

### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Node.js | v16 or higher | [nodejs.org](https://nodejs.org/) |
| MongoDB | v5 or higher | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Git (optional) | Latest | [git-scm.com](https://git-scm.com/) |

### Installation

#### Method 1: One-Click Setup (Windows)

```batch
# Clone the repository
git clone https://github.com/Abhinav15092005/University-Management-System.git
cd University-Management-System

# Double-click start.bat
start.bat

Method 2: Manual Setup

# Clone the repository
git clone https://github.com/Abhinav15092005/University-Management-System.git
cd University-Management-System

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Create .env file in server folder
echo MONGODB_URI=mongodb://localhost:27017/sms > server/.env
echo JWT_SECRET=your-super-secret-key-change-this >> server/.env
echo PORT=5000 >> server/.env
echo NODE_ENV=development >> server/.env

# Start MongoDB (in separate terminal)
mongod --dbpath ./data

# Start backend (in separate terminal)
cd server
npm start

# Start frontend (in separate terminal)
cd client
npm start

First-Time Login

After starting the application, you need to create an admin user:

// Open mongosh in a new terminal
mongosh
use sms

// Create admin user
// its your choice to change its value

db.users.insertOne({
  universityId: "ADMIN001",
  fullName: "System Administrator",
  personalEmail: "admin@university.edu",
  universityEmail: "admin@university.edu",
  mobileNumber: "9999999999",
  role: "admin",
  password: "copy_and_paste_it_by_running_server/create-hash.js_seperately",
  isActive: true,
  dateOfBirth: new Date("1990-01-01"),
  gender: "male",
  nationality: "Indian",
  temporaryAddress: "University Campus",
  permanentAddress: "University Campus"
})

Then login at http://localhost:3000 with:

Email: admin@university.edu

Password: admin123

📁 Project Structure

University-Management-System/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── contexts/      # React contexts
│   └── package.json       # Frontend dependencies
│
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── package.json       # Backend dependencies
│
├── excel-templates/        # Excel template files
├── start.bat              # One-click launcher (Windows)
├── create-admin.js        # Admin creation script
└── README.md              # This file

📊 Excel Import Format

Students Sheet

Column	          | Required	             | Description
universityId	    | Yes	                   | Unique student ID
fullName	        | Yes	                   | Student's full name
personalEmail	    | Yes	                   | Personal email address
universityEmail	  | Yes	                   | University email address
mobileNumber	    | Yes                    | Contact number
course	          | Yes                    | Course name
semester	        | Yes                  	 | Current semester
dateOfBirth	      | Yes	                   | YYYY-MM-DD format
gender	          | Yes	                   | male/female/other
nationality	      | Yes	                   | Country name
temporaryAddress	| Yes	                   | Hostel/Local address
permanentAddress	| Yes	                   | Permanent address
fatherName	      | No	                   | Father's name
motherName	      | No	                   | Mother's name

Teachers Sheet

Column	          | Required	             | Description
employeeId	      | Yes                    | Unique employee ID
fullName	        | Yes	                   | Teacher's full name
personalEmail     |	Yes	                   | Personal email
universityEmail	  | Yes	                   | University email
mobileNumber	    | Yes	                   | Contact number
department	      | Yes	                   | Department name
designation	      | Yes	                   | Job title
joiningDate	      | Yes	                   | YYYY-MM-DD format
salaryBasic	      | No	                   | Basic salary amount

HR_Staff Sheet

Column	          | Required	              | Description
employeeId	      | Yes	                    | Unique employee ID
fullName	        | Yes	                    | HR staff name
personalEmail	    | Yes	                    | Personal email
universityEmail	  | Yes	                    | University email
mobileNumber	    | Yes	                    | Contact number
designation	      | Yes	                    | Job title

Parents_Guardians Sheet

Column	                        | Required	              | Description
studentUniversityId	            | Yes	                    | Student's university ID
fatherName	                    | No	                    | Father's full name
fatherMobile	                  | No	                    | Father's contact
motherName	                    | No	                    | Mother's full name
motherMobile	                  | No	                    | Mother's contact

🔧 Environment Variables
Create .env file in the server folder:

MONGODB_URI=mongodb://localhost:27017/sms
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
NODE_ENV=development

🛠️ Available Scripts
Backend (in /server folder)

npm start          # Start production server
npm run dev        # Start development server with auto-reload

Frontend (in /client folder)

npm start          # Start development server
npm run build      # Create production build

📱 Default Ports

Service	                | Port	| URL
Frontend	              | 3000	| http://localhost:3000
Backend	                | 5000	| http://localhost:5000
MongoDB	                | 27017	| http://localhost:27017

🤝 Contributing

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is for educational purposes.

🙏 Acknowledgments
MongoDB for database

Express.js for backend framework

React for frontend library

Node.js for runtime environment

All contributors and users

🎯 System Requirements

Component	              | Minimum	                          | Recommended
RAM	                    | 2GB	                              | 4GB or more
Storage	                | 1GB free	                        | 2GB free
Processor	              | Dual core 1.5GHz	                | Quad core 2.0GHz+
OS	                    | Windows 10, macOS 11, Linux	      | Latest OS version

✅ Features Status

Feature	                                                    | Status
Student Dashboard	                                          | ✅ Complete
Teacher Dashboard	                                          | ✅ Complete
HR Dashboard	                                              | ✅ Complete
Admin Dashboard	                                            | ✅ Complete
AI Chatbot	                                                | ✅ Complete
Excel Import/Export	                                        | ✅ Complete
Auto Backup	                                                | ✅ Complete
Attendance Tracking	                                        | ✅ Complete
Result Management	                                          | ✅ Complete
Scholarship System	                                        | ✅ Complete
Responsive Design	                                          | ✅ Complete
JWT Authentication	                                        | ✅ Complete
