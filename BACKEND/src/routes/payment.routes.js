import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/verify/:reference', protect, paymentController.verifyPayment);

export default router;