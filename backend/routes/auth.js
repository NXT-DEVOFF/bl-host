const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/refresh', authenticateToken, authController.refreshToken);
router.get('/me', authenticateToken, authController.me);

module.exports = router;