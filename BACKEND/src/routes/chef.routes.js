import express from 'express';
import * as content from '../controllers/content.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', content.getChef);
router.put('/', protect, adminOnly, content.updateChef);

export default router;