import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';
import { SALE_SOURCE } from '../constants/saleSource.js';

const saleSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD']
        },
        description: { type: String, required: [true, 'Description is required'], trim: true },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than zero']
        },
        method: { type: String, default: 'cash' },
        source: {
            type: String,
            enum: Object.values(SALE_SOURCE),
            required: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            unique: true,
            sparse: true // allows multiple offline sales with no orderId
        }
    },
    makeSchemaOptions()
);

export default mongoose.model('Sale', saleSchema);