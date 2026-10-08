import axios from 'axios';
import AppError from '../utils/AppError.js';

const KEY = (process.env.PAYSTACK_SECRET_KEY || '').trim();
const IS_STUB =
    process.env.NODE_ENV === 'development' &&
    (!KEY || KEY.includes('xxxxx') || KEY.length < 20);
console.log('💳 Paystack mode:', IS_STUB ? 'STUB (dev)' : `LIVE (key: ${KEY.slice(0, 12)}...)`);

const paystackClient = axios.create({
    baseURL: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json'
    },
    timeout: 15000
});

export const initializeTransaction = async ({ email, amountNaira, reference, callbackUrl, metadata }) => {
    // DEV STUB — returns a fake URL so the order flow keeps working without live keys
    if (IS_STUB) {
        return {
            authorization_url: `${process.env.FRONTEND_URL}/payment/mock?reference=${reference}`,
            access_code: 'stub_access_code',
            reference
        };
    }

    try {
        const response = await paystackClient.post('/transaction/initialize', {
            email,
            amount: Math.round(amountNaira * 100),
            reference,
            callback_url: callbackUrl,
            metadata: metadata || {}
        });

        if (!response.data?.status) {
            throw new AppError('Payment initialization failed.', 502);
        }

        return {
            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference: response.data.data.reference
        };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Payment gateway error';
        throw new AppError(message, 502);
    }
};

export const verifyTransaction = async (reference) => {
    if (IS_STUB) {
        return { status: 'success', reference };
    }
    try {
        const response = await paystackClient.get(`/transaction/verify/${reference}`);
        return response.data.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Could not verify transaction';
        throw new AppError(message, 502);
    }
};