import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { ROLES } from '../constants/roles.js';

// Authentication: verifies JWT, attaches user to req
export const protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('Not authorized, no token provided', 401);
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new AppError('User no longer exists', 401);
    }

    req.user = user;
    next();
});

// Authorization: role check
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }
        next();
    };
};

// Admin shortcut — used on admin routes
export const adminOnly = restrictTo(ROLES.ADMIN);