import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import generateToken from '../utils/generateToken.js';
import { ROLES } from '../constants/roles.js';

export const registerUser = async ({ name, email, phone, password }) => {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new AppError('An account with this email already exists.', 409);
    }

    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: ROLES.USER
    });

    const token = generateToken(user._id);
    return { token, user };
};

export const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new AppError('Email and password are required.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        throw new AppError('Email or password is incorrect.', 401);
    }

    const token = generateToken(user._id);
    return { token, user };
};

export const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User no longer exists.', 401);
    }
    return user;
};