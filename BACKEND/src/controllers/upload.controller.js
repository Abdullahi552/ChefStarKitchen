import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file uploaded. Field name must be "file".', 400);
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ url });
});