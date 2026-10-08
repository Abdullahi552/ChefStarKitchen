import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Customer — must be logged in
router.post('/', protect, orderController.createOrder);
router.get('/mine', protect, orderController.getMyOrders);

// Admin — list all + update status
router.get('/', protect, adminOnly, orderController.getAllOrders);
router.put('/:id', protect, adminOnly, orderController.updateOrder);

export default router;