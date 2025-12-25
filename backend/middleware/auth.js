const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  console.log('🔒 Auth middleware checking...');
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token received:', token.substring(0, 50) + '...');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded. User ID:', decoded.id);
      
      // Get user from database
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!req.user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('✅ User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Checking authorization for role:', req.user?.role);
    console.log('Required roles:', roles);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ User role ${req.user.role} is not authorized`);
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    console.log('✅ Authorization granted for role:', req.user.role);
    next();
  };
};

module.exports = { protect, authorize };