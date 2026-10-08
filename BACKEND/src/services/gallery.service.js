import GalleryItem from '../models/GalleryItem.js';
import AppError from '../utils/AppError.js';

export const getAllGalleryItems = async () => {
    return await GalleryItem.find().sort({ createdAt: 1 });
};

export const createGalleryItem = async (data) => {
    return await GalleryItem.create(data);
};

export const updateGalleryItem = async (id, data) => {
    const item = await GalleryItem.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
    if (!item) throw new AppError('Gallery item not found', 404);
    return item;
};

export const deleteGalleryItem = async (id) => {
    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) throw new AppError('Gallery item not found', 404);
};