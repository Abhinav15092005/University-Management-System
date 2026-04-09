const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('========================================');
    console.log('LOGIN ATTEMPT:');
    console.log('Email provided:', email);
    console.log('Password provided:', password ? '******' : 'empty');
    
    // Find user by personalEmail OR universityEmail
    const user = await User.findOne({
      $or: [
        { personalEmail: email },
        { universityEmail: email }
      ]
    });
    
    if (!user) {
      console.log('❌ User NOT found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ User found:', user.personalEmail);
    console.log('User role:', user.role);
    console.log('Stored password hash:', user.password);
    
    // Compare password using bcrypt directly
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password mismatch for:', user.personalEmail);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ Login successful for:', user.personalEmail);
    console.log('========================================');
    
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.fullName,
        email: user.personalEmail || user.universityEmail,
        role: user.role,
        universityId: user.universityId
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Register disabled
exports.register = async (req, res) => {
  res.status(403).json({ error: 'Registration disabled. Contact HR department.' });
};