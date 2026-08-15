const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Validate JWT token against live MongoDB user document
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists in database' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorizeTrainer = (req, res, next) => {
  if (req.user && (req.user.role === 'trainer' || req.user.role === 'admin' || req.user.role === 'instructor')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Trainer role required' });
  }
};

module.exports = { protect, authorizeTrainer, JWT_SECRET };
