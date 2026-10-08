import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';

const trackerSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        description: { type: String, default: '' },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount must be positive']
        }
    },
    makeSchemaOptions()
);

export default mongoose.model('Tracker', trackerSchema);