import rateLimit from 'express-rate-limit';

// For login/register: prevent brute force
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per IP
    message: { message: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// For public events form: prevent spam
export const publicFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 submissions per IP per hour
    message: { message: 'Too many submissions. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});