import Expense from '../models/Expense.js';
import Tracker from '../models/Tracker.js';
import AppError from '../utils/AppError.js';

export const getAllExpenses = async (filters = {}) => {
    const query = {};
    // The UI can filter by ?tracker=ID
    if (filters.tracker) query.trackerId = filters.tracker;
    return await Expense.find(query).sort({ date: -1, createdAt: -1 });
};

export const createExpense = async (data) => {
    if (!data.amount || data.amount <= 0) {
        throw new AppError('Amount must be greater than zero.', 400);
    }
    // Verify the tracker exists (referential integrity)
    const tracker = await Tracker.findById(data.trackerId);
    if (!tracker) throw new AppError('Tracker not found', 404);

    // Coerce string amounts coming from the form
    const payload = {
        ...data,
        amount: Number(data.amount),
        trackerId: data.trackerId
    };

    return await Expense.create(payload);
};

export const deleteExpense = async (id) => {
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) throw new AppError('Expense not found', 404);
};