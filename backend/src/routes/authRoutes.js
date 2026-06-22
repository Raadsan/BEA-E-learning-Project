import express from 'express';
import { login, /* verifyOtp, resendOtp, */ getCurrentUser, verifyToken, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
// OTP routes disabled — uncomment when re-enabling email OTP login
// router.post('/verify-otp', verifyOtp);
// router.post('/resend-otp', resendOtp);
router.get('/me', verifyToken, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
