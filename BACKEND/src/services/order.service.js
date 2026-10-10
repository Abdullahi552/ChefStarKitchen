import Order from '../models/Order.js';
import Counter from '../models/Counter.js';
import MenuItem from '../models/MenuItem.js';
import Special from '../models/Special.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { PAYMENT_STATUS } from '../constants/paymentStatus.js';
import { validateDeliveryLocation } from './geocoding.service.js';
import * as paystackService from './paystack.service.js';

// ---------- Repricing ----------
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
        if (raw.kind === 'menu') dbItem = await MenuItem.findById(raw.id);
        else if (raw.kind === 'specials') dbItem = await Special.findById(raw.id);
        else throw new AppError('Item kind must be "menu" or "specials".', 400);

        if (!dbItem) throw new AppError(`Item ${raw.id} not found.`, 404);

        pricedItems.push({
            kind: raw.kind,
            id: raw.id.toString(),
            name: dbItem.name,
            price: dbItem.price,
            qty
        });
    }

    const total = pricedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    return { items: pricedItems, total };
};

// ---------- CREATE ORDER ----------
export const createOrder = async (userId, { items, delivery }) => {
    if (!delivery || !delivery.type || !delivery.name || !delivery.phone) {
        throw new AppError('Delivery name, phone and type are required.', 400);
    }
    if (delivery.type === 'delivery' && !delivery.address) {
        throw new AppError('Delivery address is required for delivery orders.', 400);
    }

    // Server-side location verification via Nominatim
    let verifiedLocation = null;
    if (delivery.type === 'delivery') {
        const verified = await validateDeliveryLocation(delivery);
        verifiedLocation = {
            lat: delivery.location.lat,
            lng: delivery.location.lng,
            placeId: verified.placeId || delivery.location.placeId || ''
        };
        // Override submitted address with Nominatim's confirmed version
        delivery.address = verified.formattedAddress;
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const { items: pricedItems, total } = await repriceItems(items);

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
            landmark: delivery.landmark || '',
            notes: delivery.notes || '',
            location: verifiedLocation
        },
        total,
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.NEW,
        statusHistory: [{ status: ORDER_STATUS.NEW }]
    });

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
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        await order.save();
        throw err;
    }

    return { order, payment };
};

// ---------- READS ----------
const POPULATE_USER = { path: 'userId', select: 'name email phone' };

export const getOrdersByUser = async (userId) => {
    const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .populate(POPULATE_USER);
    return orders.map(shapeOrder);
};

export const getAllOrders = async () => {
    const orders = await Order.find()
        .sort({ createdAt: 1 })
        .populate(POPULATE_USER);
    return orders.map(shapeOrder);
};

export const getOrderByShortId = async (shortId) => {
    const order = await Order.findOne({ shortId: Number(shortId) }).populate(POPULATE_USER);
    if (!order) throw new AppError('Order not found', 404);
    return shapeOrder(order);
};

// ---------- UPDATE STATUS (admin only) ----------
export const updateOrderStatus = async (shortId, body, adminUserId) => {
    const allowed = ['status'];
    const extra = Object.keys(body).filter((k) => !allowed.includes(k));
    if (extra.length > 0) {
        throw new AppError(
            `Only "status" can be updated. Rejected fields: ${extra.join(', ')}`,
            400
        );
    }

    const { status } = body;
    if (!status) throw new AppError('Status is required.', 400);
    if (!Object.values(ORDER_STATUS).includes(status)) {
        throw new AppError('Invalid order status.', 400);
    }

    const order = await Order.findOne({ shortId: Number(shortId) });
    if (!order) throw new AppError('Order not found', 404);

    if (order.status !== status) {
        order.status = status;
        order.statusHistory.push({ status, changedBy: adminUserId });
        await order.save();
    }

    await order.populate(POPULATE_USER);
    return shapeOrder(order);
};

// ---------- UPDATE DELIVERY (customer only) ----------
export const updateOrderDelivery = async (shortId, userId, { delivery }) => {
    const order = await Order.findOne({ shortId: Number(shortId) });
    if (!order) throw new AppError('Order not found', 404);

    // Ownership check
    if (order.userId._id.toString() !== userId.toString()) {
        throw new AppError('You do not have permission to edit this order.', 403);
    }

    // Status check
    if (order.status !== ORDER_STATUS.NEW) {
        throw new AppError(
            'This order is already being prepared and can no longer be edited.',
            409
        );
    }

    if (!delivery || typeof delivery !== 'object') {
        throw new AppError('Delivery details are required.', 400);
    }

    // Re-validate location if customer changed the address
    let verifiedLocation = order.delivery.location;

    if (order.delivery.type === 'delivery') {
        if (delivery.location) {
            const verified = await validateDeliveryLocation({
                type: 'delivery',
                location: delivery.location
            });
            verifiedLocation = {
                lat: delivery.location.lat,
                lng: delivery.location.lng,
                placeId: verified.placeId || delivery.location.placeId || ''
            };
            delivery.address = verified.formattedAddress;
        } else if (delivery.address && delivery.address !== order.delivery.address) {
            throw new AppError('Please confirm your new address on the map.', 400);
        }
    }

    // Merge allowed fields only
    if (delivery.phone) order.delivery.phone = delivery.phone;
    if (delivery.address) order.delivery.address = delivery.address;
    if (delivery.landmark !== undefined) order.delivery.landmark = delivery.landmark;
    if (delivery.notes !== undefined) order.delivery.notes = delivery.notes;
    if (verifiedLocation) order.delivery.location = verifiedLocation;

    await order.save();
    await order.populate(POPULATE_USER);
    return shapeOrder(order);
};

// ---------- SHAPE RESPONSE ----------
const shapeOrder = (order) => {
    const obj = order.toObject();
    const customer = obj.userId
        ? {
              name: obj.userId.name,
              email: obj.userId.email,
              phone: obj.userId.phone
          }
        : {
              name: obj.delivery?.name || '',
              email: '',
              phone: obj.delivery?.phone || ''
          };

    return {
        id: obj.shortId || obj.id,
        reference: obj.reference,
        createdAt: obj.createdAt,
        paymentStatus: obj.paymentStatus,
        status: obj.status,
        total: obj.total,
        items: obj.items,
        delivery: obj.delivery,
        customer
    };
};