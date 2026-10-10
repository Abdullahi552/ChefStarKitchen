import * as authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';
import * as googleService from '../services/google.service.js';

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


/**
 * GET /api/auth/google
 * Redirects the user to Google's consent page.
 */
export const googleLogin = (req, res) => {
    const url = googleService.buildGoogleAuthUrl();
    res.redirect(url);
};

/**
 * GET /api/auth/google/callback
 * Google redirects here after the user grants consent.
 * We exchange the code, find/create the user, then redirect back to the frontend.
 */
export const googleCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL;

    try {
        const { code, error } = req.query;

        // User denied consent or Google returned an error
        if (error || !code) {
            return res.redirect(
                `${frontendUrl}/login?error=${encodeURIComponent('Google sign-in was cancelled')}`
            );
        }

        // 1. Exchange code for tokens
        const tokens = await googleService.exchangeCodeForTokens(code);

        // 2. Fetch user profile from Google
        const profile = await googleService.fetchGoogleUser(tokens.access_token);

        if (!profile.email) {
            return res.redirect(
                `${frontendUrl}/login?error=${encodeURIComponent('Google account has no email')}`
            );
        }

        // 3. Find or create the user
        const { token } = await authService.findOrCreateGoogleUser({
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            picture: profile.picture,
            googleId: profile.id
        });

        // 4. Redirect back to the frontend with the JWT
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (err) {
        console.error('Google callback error:', err.message);
        res.redirect(
            `${frontendUrl}/login?error=${encodeURIComponent(err.message || 'Google sign-in failed')}`
        );
    }
};