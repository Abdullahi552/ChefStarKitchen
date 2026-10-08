import express from 'express';
import * as content from '../controllers/content.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', content.getGallery);
router.post('/', protect, adminOnly, content.createGalleryItem);
router.put('/:id', protect, adminOnly, content.updateGalleryItem);
router.delete('/:id', protect, adminOnly, content.deleteGalleryItem);

export default router;