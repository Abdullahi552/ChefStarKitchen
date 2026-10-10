import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', protect, authController.getMe);

// Google OAuth
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

export default router;