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
/**
 * Find an existing user by email, or create one from Google profile data.
 * Returns { user, token } — same shape as registerUser/loginUser.
 */
export const findOrCreateGoogleUser = async ({ email, name, picture, googleId }) => {
    // 1. Look for existing user (either by email or googleId)
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
        // Existing user — link their account to Google if not already linked
        if (!user.googleId) {
            user.googleId = googleId;
            if (!user.image && picture) user.image = picture;
            await user.save();
        }
        const token = generateToken(user._id);
        return { user, token };
    }

    // 2. New user — create with role "user"
    user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        image: picture || '',
        role: ROLES.USER
        // Note: no password — Google users don't have one
    });

    const token = generateToken(user._id);
    return { user, token };
};