import Sale from '../models/Sale.js';
import AppError from '../utils/AppError.js';
import { SALE_SOURCE } from '../constants/saleSource.js';

export const getAllSales = async () => {
    return await Sale.find().sort({ date: -1, createdAt: -1 });
};

export const createOfflineSale = async (data) => {
    if (!data.amount || data.amount <= 0) {
        throw new AppError('Amount must be greater than zero.', 400);
    }

    // The client can ONLY create offline sales. Force the source.
    return await Sale.create({
        date: data.date,
        description: data.description,
        amount: Number(data.amount),
        method: data.method || 'cash',
        source: SALE_SOURCE.OFFLINE
    });
};

// The client can ONLY delete offline sales. Online sales are the audit trail.
export const deleteSale = async (id) => {
    const sale = await Sale.findById(id);
    if (!sale) throw new AppError('Sale not found', 404);

    if (sale.source === SALE_SOURCE.ONLINE) {
        throw new AppError('Online sales cannot be deleted.', 403);
    }

    await sale.deleteOne();
};