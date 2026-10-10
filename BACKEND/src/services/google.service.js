import axios from 'axios';
import AppError from '../utils/AppError.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * Build the URL the user is redirected to when they click "Sign in with Google".
 */
export const buildGoogleAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

/**
 * Exchange the authorization code for tokens (id_token, access_token).
 */
export const exchangeCodeForTokens = async (code) => {
    if (!code) throw new AppError('Authorization code missing', 400);

    try {
        const response = await axios.post(GOOGLE_TOKEN_URL, null, {
            params: {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_CALLBACK_URL,
                grant_type: 'authorization_code'
            }
        });
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.error_description ||
            error.response?.data?.error ||
            'Google token exchange failed';
        throw new AppError(message, 401);
    }
};

/**
 * Fetch the user's profile (email, name, picture) using the access token.
 */
export const fetchGoogleUser = async (accessToken) => {
    try {
        const response = await axios.get(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        throw new AppError('Failed to fetch Google user profile', 401);
    }
};