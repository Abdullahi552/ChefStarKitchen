import * as orderService from '../services/order.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createOrder = catchAsync(async (req, res) => {
    const result = await orderService.createOrder(req.user._id, req.body);
    res.status(200).json({
        order: result.order,
        payment: {
            authorization_url: result.payment.authorization_url,
            reference: result.payment.reference
        }
    });
});

export const getMyOrders = catchAsync(async (req, res) => {
    const orders = await orderService.getOrdersByUser(req.user._id);
    res.status(200).json(orders);
});

export const getAllOrders = catchAsync(async (req, res) => {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
});

export const updateOrder = catchAsync(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body);
    res.status(200).json(order);
});