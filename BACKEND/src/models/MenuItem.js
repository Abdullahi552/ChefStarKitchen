import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';
import { MENU_CATEGORIES } from '../constants/menuCategories.js';

const menuItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: MENU_CATEGORIES
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        image: { type: String, default: '' },
        description: { type: String, default: '' }
    },
    makeSchemaOptions()
);

export default mongoose.model('MenuItem', menuItemSchema);