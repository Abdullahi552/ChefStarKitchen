import express from 'express';
import * as content from '../controllers/content.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public
router.get('/', content.getMenu);
router.get('/:id', content.getMenuItem);

// Admin only
router.post('/', protect, adminOnly, content.createMenuItem);
router.put('/:id', protect, adminOnly, content.updateMenuItem);
router.delete('/:id', protect, adminOnly, content.deleteMenuItem);

export default router;