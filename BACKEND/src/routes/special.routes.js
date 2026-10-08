import express from 'express';
import * as content from '../controllers/content.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', content.getSpecials);
router.post('/', protect, adminOnly, content.createSpecial);
router.put('/:id', protect, adminOnly, content.updateSpecial);
router.delete('/:id', protect, adminOnly, content.deleteSpecial);

export default router;