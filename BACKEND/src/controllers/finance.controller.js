import * as trackerService from '../services/tracker.service.js';
import * as expenseService from '../services/expense.service.js';
import * as saleService from '../services/sale.service.js';
import catchAsync from '../utils/catchAsync.js';

// ---------- TRACKERS ----------
export const getTrackers = catchAsync(async (req, res) => {
    const items = await trackerService.getAllTrackers();
    res.status(200).json(items);
});

export const createTracker = catchAsync(async (req, res) => {
    const item = await trackerService.createTracker(req.body);
    res.status(201).json(item);
});

export const updateTracker = catchAsync(async (req, res) => {
    const item = await trackerService.updateTracker(req.params.id, req.body);
    res.status(200).json(item);
});

export const deleteTracker = catchAsync(async (req, res) => {
    await trackerService.deleteTracker(req.params.id);
    res.status(204).send();
});

// ---------- EXPENSES ----------
export const getExpenses = catchAsync(async (req, res) => {
    const items = await expenseService.getAllExpenses(req.query);
    res.status(200).json(items);
});

export const createExpense = catchAsync(async (req, res) => {
    const item = await expenseService.createExpense(req.body);
    res.status(201).json(item);
});

export const deleteExpense = catchAsync(async (req, res) => {
    await expenseService.deleteExpense(req.params.id);
    res.status(204).send();
});

// ---------- SALES ----------
export const getSales = catchAsync(async (req, res) => {
    const items = await saleService.getAllSales();
    res.status(200).json(items);
});

export const createSale = catchAsync(async (req, res) => {
    const item = await saleService.createOfflineSale(req.body);
    res.status(201).json(item);
});

export const deleteSale = catchAsync(async (req, res) => {
    await saleService.deleteSale(req.params.id);
    res.status(204).send();
});