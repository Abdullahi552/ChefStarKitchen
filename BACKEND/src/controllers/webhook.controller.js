import crypto from 'crypto';
import * as paymentService from '../services/payment.service.js';

/**
 * Constant-time comparison to prevent timing attacks on the signature check.
 */
const safeCompare = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Paystack webhook handler.
 * Paystack POSTs events here (charge.success, transfer.success, etc.).
 * Docs: https://paystack.com/docs/payments/webhooks/
 */
export const paystackWebhook = async (req, res) => {
    try {
        // ---- TEMPORARY DEV BYPASS (REMOVE BEFORE PRODUCTION) ----
        if (
            process.env.NODE_ENV === 'development' &&
            req.headers['x-dev-bypass'] === 'true'
        ) {
            const event = JSON.parse(req.rawBody?.toString() || '{}');
            console.warn('⚠️  [DEV] Webhook bypass used for', event.event);

            res.status(200).json({ received: true, devBypass: true });

            if (event.event === 'charge.success' && event.data?.reference) {
                try {
                    const result = await paymentService.confirmOrderPayment(
                        event.data.reference,
                        { forceDev: true }
                    );
                    console.log(`[DEV] Webhook processed: ${event.data.reference}`, {
                        success: result.success,
                        alreadyPaid: result.alreadyPaid,
                        failed: result.failed,
                        pending: result.pending
                    });
                } catch (err) {
                    console.error(`[DEV] Webhook processing failed:`, err.message);
                }
            }
            return;
        }
        // ---- END DEV BYPASS ----

        const signature = req.headers['x-paystack-signature'];

        // 1. Signature + raw body must be present
        if (!signature || !req.rawBody) {
            return res.status(401).json({ message: 'Missing signature or body' });
        }

        // 2. Compute expected HMAC-SHA512 over the RAW body
        const expected = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(req.rawBody)
            .digest('hex');

        // 3. Constant-time comparison
        if (!safeCompare(expected, signature)) {
            console.warn('Webhook signature mismatch — possible spoofed request');
            return res.status(401).json({ message: 'Invalid signature' });
        }

        // 4. Parse the verified event
        let event;
        try {
            event = JSON.parse(req.rawBody.toString());
        } catch (err) {
            return res.status(400).json({ message: 'Invalid JSON body' });
        }

        // 5. Acknowledge immediately — Paystack retries on non-2xx
        res.status(200).json({ received: true });

        // 6. Process async AFTER responding
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
                    alreadyPaid: result.alreadyPaid,
                    failed: result.failed,
                    pending: result.pending
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