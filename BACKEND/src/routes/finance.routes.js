import express from 'express';
import * as finance from '../controllers/finance.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Every finance route is admin-only
router.use(protect, adminOnly);

// Trackers
router.get('/trackers', finance.getTrackers);
router.post('/trackers', finance.createTracker);
router.put('/trackers/:id', finance.updateTracker);
router.delete('/trackers/:id', finance.deleteTracker);

// Expenses
router.get('/expenses', finance.getExpenses);
router.post('/expenses', finance.createExpense);
router.delete('/expenses/:id', finance.deleteExpense);

// Sales
router.get('/sales', finance.getSales);
router.post('/sales', finance.createSale);
router.delete('/sales/:id', finance.deleteSale);

export default router;