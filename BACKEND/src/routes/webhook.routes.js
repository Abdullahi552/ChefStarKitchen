import express from 'express';
import * as webhookController from '../controllers/webhook.controller.js';

const router = express.Router();

// NO protect middleware — Paystack can't send a JWT
// Signature verification happens inside the controller
router.post('/paystack', webhookController.paystackWebhook);

export default router;