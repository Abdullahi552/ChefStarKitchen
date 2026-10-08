import MenuItem from '../models/MenuItem.js';
import AppError from '../utils/AppError.js';

export const getAllMenuItems = async () => {
    // Oldest first per doc §2.3
    return await MenuItem.find().sort({ createdAt: 1 });
};

export const getMenuItemById = async (id) => {
    const item = await MenuItem.findById(id);
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
};

export const createMenuItem = async (data) => {
    return await MenuItem.create(data);
};

export const updateMenuItem = async (id, data) => {
    // Partial update — pass only provided fields
    const item = await MenuItem.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
};

export const deleteMenuItem = async (id) => {
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) throw new AppError('Menu item not found', 404);
};