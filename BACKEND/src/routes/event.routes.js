import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Public — create only
router.post('/', publicFormLimiter, eventController.createEvent);

// Admin — read + status update only (no POST/DELETE per B5)
router.get('/', protect, adminOnly, eventController.getEvents);
router.put('/:id', protect, adminOnly, eventController.updateEvent);

export default router;