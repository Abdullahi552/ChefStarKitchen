import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Public — the home page form hits this
router.post('/', publicFormLimiter, eventController.createEvent);

// Admin-only
router.get('/', protect, adminOnly, eventController.getEvents);
router.put('/:id', protect, adminOnly, eventController.updateEvent);
router.delete('/:id', protect, adminOnly, eventController.deleteEvent);

export default router;