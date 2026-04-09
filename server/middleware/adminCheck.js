const User = require('../models/User');

const checkAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkAdmin };