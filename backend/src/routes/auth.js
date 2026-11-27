const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, googleAuth, refreshTokenHandler, logout, getMe, forgotPassword, resetPassword, updateProfile, changePassword, sendOtp, verifyOtp } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register);
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);
router.post('/google', [
  body('idToken').notEmpty().withMessage('Google ID token is required'),
], validate, googleAuth);
router.post('/refresh-token', refreshTokenHandler);
router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required')], validate, forgotPassword);
router.post('/reset-password', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, resetPassword);
router.post('/send-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, sendOtp);
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
], validate, verifyOtp);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
], validate, updateProfile);
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);

module.exports = router;
