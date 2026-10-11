import crypto from 'crypto';
import * as paymentService from '../services/payment.service.js';

const safeCompare = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const paystackWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];

        if (!signature || !req.rawBody) {
            return res.status(401).json({ message: 'Missing signature or body' });
        }

        const expected = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(req.rawBody)
            .digest('hex');

        if (!safeCompare(expected, signature)) {
            console.warn('Webhook signature mismatch — possible spoofed request');
            return res.status(401).json({ message: 'Invalid signature' });
        }

        let event;
        try {
            event = JSON.parse(req.rawBody.toString());
        } catch (err) {
            return res.status(400).json({ message: 'Invalid JSON body' });
        }

        res.status(200).json({ received: true });

        if (event.event === 'charge.success') {
            const reference = event.data?.reference;
            if (!reference) {
                console.warn('charge.success event missing reference');
                return;
            }

            try {
                const result = await paymentService.confirmOrderPayment(reference);
                console.log(`Webhook processed: ${reference}`, {
                    success: result.success,
                    alreadyPaid: result.alreadyPaid
                });
            } catch (err) {
                console.error(`Webhook processing failed for ${reference}:`, err.message);
            }
        } else {
            console.log(`Webhook event ignored: ${event.event}`);
        }
    } catch (err) {
        console.error('Webhook handler error:', err.message);
        if (!res.headersSent) {
            res.status(200).json({ received: true });
        }
    }
};