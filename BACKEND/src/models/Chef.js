import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';

const chefSchema = new mongoose.Schema(
    {
        name: { type: String, default: '' },
        title: { type: String, default: '' },
        image: { type: String, default: '' },
        bio: { type: String, default: '' },
        quote: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },
    makeSchemaOptions()
);

export default mongoose.model('Chef', chefSchema);