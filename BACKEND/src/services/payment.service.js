import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Sale from '../models/Sale.js';
import AppError from '../utils/AppError.js';
import { PAYMENT_STATUS } from '../constants/paymentStatus.js';
import { SALE_SOURCE } from '../constants/saleSource.js';
import * as paystackService from './paystack.service.js';

// Get "today" in Africa/Lagos timezone (Nigeria, UTC+1)
const todayInLagos = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Lagos',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now); // en-CA gives YYYY-MM-DD
};

/**
 * Confirm an order's payment. Idempotent — safe to call from both
 * the webhook AND the verify endpoint.
 *
 * @param {string} reference - Order reference (CS-x-hex)
 * @param {object} options
 * @param {boolean} options.forceDev - DEV ONLY: skip Paystack verification (NODE_ENV must be development)
 */
export const confirmOrderPayment = async (reference, options = {}) => {
    const { forceDev = false } = options;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ reference }).session(session);
        if (!order) throw new AppError('Order not found', 404);

        // IDEMPOTENCY: if already paid, do nothing
        if (order.paymentStatus === PAYMENT_STATUS.PAID) {
            await session.commitTransaction();
            session.endSession();
            return { order, alreadyPaid: true };
        }

        // Re-verify with Paystack (never trust the webhook payload alone)
        let verification;
        if (forceDev && process.env.NODE_ENV === 'development') {
            verification = {
                status: 'success',
                amount: order.total * 100 // kobo
            };
            console.log(`🛠 [DEV] Force-confirming ${reference}`);
        } else {
            verification = await paystackService.verifyTransaction(reference);
        }

        if (!verification || verification.status !== 'success') {
            // Only mark as failed if Paystack EXPLICITLY says failed.
            // "abandoned" / "ongoing" / "pending" → leave as pending, user can retry.
            const explicitFailure = verification?.status === 'failed';
            if (explicitFailure) {
                order.paymentStatus = PAYMENT_STATUS.FAILED;
                await order.save({ session });
            }
            await session.commitTransaction();
            session.endSession();
            return {
                order,
                failed: explicitFailure,
                pending: !explicitFailure,
                paystackStatus: verification?.status
            };
        }

        // Amount sanity check — the amount paid must match the order total
        const paidNaira = Math.round(verification.amount / 100); // kobo → naira
        if (paidNaira !== order.total) {
            throw new AppError(
                `Amount mismatch: expected ${order.total}, received ${paidNaira}`,
                400
            );
        }

        // Flip order to paid
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.paidAt = new Date();
        await order.save({ session });

        // Create the online sale — only once per order
        const existingSale = await Sale.findOne({ orderId: order._id }).session(session);
        if (!existingSale) {
            await Sale.create(
                [{
                    date: todayInLagos(),
                    description: `Online order #${order.shortId}`,
                    amount: order.total,
                    method: 'card',
                    source: SALE_SOURCE.ONLINE,
                    orderId: order._id
                }],
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return { order, success: true };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const getOrderByReference = async (reference) => {
    const order = await Order.findOne({ reference });
    if (!order) throw new AppError('Order not found', 404);
    return order;
};