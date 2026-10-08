import mongoose from 'mongoose';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { PAYMENT_STATUS } from '../constants/paymentStatus.js';

const itemSnapshotSchema = new mongoose.Schema(
    {
        kind: { type: String, enum: ['menu', 'specials'], required: true },
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 }
    },
    { _id: false }
);

const deliverySchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['delivery', 'pickup'], required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, default: '' },
        notes: { type: String, default: '' }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        shortId: { type: Number, required: true, unique: true, index: true },
        reference: { type: String, required: true, unique: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: { type: [itemSnapshotSchema], required: true },
        delivery: { type: deliverySchema, required: true },
        total: { type: Number, required: true, min: 0 },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.NEW
        },
        paidAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret.shortId;
                delete ret._id;
                delete ret.shortId;
                delete ret.__v;
                return ret;
            }
        }
    }
);

export default mongoose.model('Order', orderSchema);