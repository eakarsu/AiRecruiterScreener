const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout,
  getDemoCredentials,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/request-password-reset', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/verify-email', verifyEmail);
router.get('/demo-credentials', getDemoCredentials);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/resend-verification', authMiddleware, resendVerification);
router.post('/logout', authMiddleware, logout);

module.exports = router;
