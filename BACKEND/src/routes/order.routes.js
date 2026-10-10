import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Customer
router.post('/', protect, orderController.createOrder);
router.get('/mine', protect, orderController.getMyOrders);
router.put('/:id/delivery', protect, orderController.updateOrderDelivery);

// Admin
router.get('/', protect, adminOnly, orderController.getAllOrders);
router.get('/:id', protect, adminOnly, orderController.getOrder);
router.put('/:id', protect, adminOnly, orderController.updateOrder);

// Removed per B3: admin POST/DELETE on orders
// router.post('/', protect, adminOnly, ...)
// router.delete('/:id', protect, adminOnly, ...)

export default router;