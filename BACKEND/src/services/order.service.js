import Order from '../models/Order.js';
import Counter from '../models/Counter.js';
import MenuItem from '../models/MenuItem.js';
import Special from '../models/Special.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { PAYMENT_STATUS } from '../constants/paymentStatus.js';
import * as paystackService from './paystack.service.js';

/**
 * Reprice the items on the SERVER. Client prices are ignored.
 * Returns { items: [pricedItem], total }
 */
const repriceItems = async (clientItems) => {
    if (!Array.isArray(clientItems) || clientItems.length === 0) {
        throw new AppError('Order must contain at least one item.', 400);
    }

    const pricedItems = [];

    for (const raw of clientItems) {
        const qty = Number(raw.qty);
        if (!Number.isInteger(qty) || qty < 1) {
            throw new AppError('Item quantity must be a positive integer.', 400);
        }

        let dbItem;
        if (raw.kind === 'menu') {
            dbItem = await MenuItem.findById(raw.id);
        } else if (raw.kind === 'specials') {
            dbItem = await Special.findById(raw.id);
        } else {
            throw new AppError('Item kind must be "menu" or "specials".', 400);
        }

        if (!dbItem) {
            throw new AppError(`Item ${raw.id} not found.`, 404);
        }

        pricedItems.push({
            kind: raw.kind,
            id: raw.id.toString(),
            name: dbItem.name,
            price: dbItem.price,
            qty
        });
    }

    const total = pricedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    return { items: pricedItems, total };
};

/**
 * Create a new order and initialize the payment with Paystack.
 */
export const createOrder = async (userId, { items, delivery }) => {
    if (!delivery || !delivery.type || !delivery.name || !delivery.phone) {
        throw new AppError('Delivery name, phone and type are required.', 400);
    }
    if (delivery.type === 'delivery' && !delivery.address) {
        throw new AppError('Delivery address is required for delivery orders.', 400);
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const { items: pricedItems, total } = await repriceItems(items);

    // Generate short numeric id and unique reference
    const shortId = await Counter.next('order');
    const hex = Math.random().toString(16).slice(2, 6);
    const reference = `CS-${shortId}-${hex}`;

    const order = await Order.create({
        shortId,
        reference,
        userId,
        items: pricedItems,
        delivery: {
            type: delivery.type,
            name: delivery.name,
            phone: delivery.phone,
            address: delivery.address || '',
            notes: delivery.notes || ''
        },
        total,
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.NEW
    });

    // Initialize Paystack
    let payment;
    try {
        payment = await paystackService.initializeTransaction({
            email: user.email,
            amountNaira: total,
            reference,
            callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
            metadata: {
                orderId: order._id.toString(),
                shortId: order.shortId,
                userId: userId.toString()
            }
        });
    } catch (err) {
        // Payment init failed — mark order as failed so it doesn't sit around forever
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        await order.save();
        throw err;
    }

    return { order, payment };
};

export const getOrdersByUser = async (userId) => {
    // Newest first per doc §2.3
    return await Order.find({ userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
    // Oldest first per doc §2.3
    return await Order.find()
        .sort({ createdAt: 1 })
        .populate('userId', 'name email phone');
};

export const getOrderByShortId = async (shortId) => {
    const order = await Order.findOne({ shortId: Number(shortId) });
    if (!order) throw new AppError('Order not found', 404);
    return order;
};

/**
 * Admin-only status update. Payment status, total, and items are immutable here.
 */
export const updateOrderStatus = async (shortId, { status }) => {
    if (!status) throw new AppError('Status is required.', 400);
    if (!Object.values(ORDER_STATUS).includes(status)) {
        throw new AppError('Invalid order status.', 400);
    }

    const order = await Order.findOneAndUpdate(
        { shortId: Number(shortId) },
        { status },
        { new: true, runValidators: true }
    );
    if (!order) throw new AppError('Order not found', 404);
    return order;
};