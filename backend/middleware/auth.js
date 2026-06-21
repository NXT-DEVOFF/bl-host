const authService = require('../services/authService');
const logger = require('../config/logger');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN',
        },
      });
    }

    const decoded = authService.verifyToken(token);
    req.userId = decoded.userId;
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    return res.status(401).json({
      success: false,
      error: {
        message: error.message || 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }
};

module.exports = { authenticateToken };
