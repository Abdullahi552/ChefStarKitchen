import Tracker from '../models/Tracker.js';
import AppError from '../utils/AppError.js';

export const getAllTrackers = async () => {
    return await Tracker.find().sort({ createdAt: 1 });
};

export const getTrackerById = async (id) => {
    const tracker = await Tracker.findById(id);
    if (!tracker) throw new AppError('Tracker not found', 404);
    return tracker;
};

export const createTracker = async (data) => {
    if (!data.totalAmount || data.totalAmount <= 0) {
        throw new AppError('Amount must be greater than zero.', 400);
    }
    return await Tracker.create(data);
};

// Partial update — the UI sends only { totalAmount: newTotal } on top-up
export const updateTracker = async (id, data) => {
    if (data.totalAmount !== undefined && data.totalAmount < 0) {
        throw new AppError('Total amount cannot be negative.', 400);
    }
    const tracker = await Tracker.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
    if (!tracker) throw new AppError('Tracker not found', 404);
    return tracker;
};

// IMPORTANT: Deleting a tracker must NOT delete its expenses (per doc §6.4)
// The UI promises the expenses stay in the records.
export const deleteTracker = async (id) => {
    const tracker = await Tracker.findByIdAndDelete(id);
    if (!tracker) throw new AppError('Tracker not found', 404);
    // Intentionally do nothing to related expenses.
};