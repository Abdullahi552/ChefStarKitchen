import * as authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
    const { token, user } = await authService.registerUser(req.body);
    res.status(201).json({ token, user });
});

export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);
    res.status(200).json({ token, user });
});

export const getMe = catchAsync(async (req, res) => {
    // req.user is attached by `protect` middleware
    res.status(200).json(req.user);
});