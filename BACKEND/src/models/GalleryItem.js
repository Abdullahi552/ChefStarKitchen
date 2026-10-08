import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';

const galleryItemSchema = new mongoose.Schema(
    {
        image: { type: String, required: [true, 'Image URL is required'] },
        caption: { type: String, default: '' }
    },
    makeSchemaOptions()
);

export default mongoose.model('GalleryItem', galleryItemSchema);