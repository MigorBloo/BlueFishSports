const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

// Basic JWT verification
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', {
      error: error.message,
      name: error.name,
      expiredAt: error.expiredAt
    });
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Enhanced JWT verification with user lookup
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    });
    
    // Get user from database
    const user = await userService.getUserById(decoded.id);
    if (!user) {
      console.log('User not found for token:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error.message,
      name: error.name,
      expiredAt: error.expiredAt
    });
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = {
  verifyToken,
  authenticateUser
}; 