import * as paymentService from '../services/payment.service.js';
import catchAsync from '../utils/catchAsync.js';

export const verifyPayment = catchAsync(async (req, res) => {
    const { reference } = req.params;

    // Always fetch the order first so we return the right shape
    const order = await paymentService.getOrderByReference(reference);

    // If not yet paid, try to confirm it
    if (order.paymentStatus !== 'paid') {
        await paymentService.confirmOrderPayment(reference);
    }

    // Return the fresh state
    const updated = await paymentService.getOrderByReference(reference);
    res.status(200).json(updated);
});