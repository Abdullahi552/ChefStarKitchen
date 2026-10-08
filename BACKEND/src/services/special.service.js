import Special from '../models/Special.js';
import AppError from '../utils/AppError.js';

export const getAllSpecials = async () => {
    return await Special.find().sort({ createdAt: 1 });
};

export const createSpecial = async (data) => {
    return await Special.create(data);
};

export const updateSpecial = async (id, data) => {
    const item = await Special.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
    if (!item) throw new AppError('Special not found', 404);
    return item;
};

export const deleteSpecial = async (id) => {
    const item = await Special.findByIdAndDelete(id);
    if (!item) throw new AppError('Special not found', 404);
};