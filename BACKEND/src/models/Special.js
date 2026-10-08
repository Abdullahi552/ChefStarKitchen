import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';

const specialSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        image: { type: String, default: '' },
        description: { type: String, default: '' },
        badge: { type: String, default: '' }
    },
    makeSchemaOptions()
);

export default mongoose.model('Special', specialSchema);