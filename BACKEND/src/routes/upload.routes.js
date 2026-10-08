import express from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import * as uploadController from '../controllers/upload.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadController.uploadFile);

export default router;