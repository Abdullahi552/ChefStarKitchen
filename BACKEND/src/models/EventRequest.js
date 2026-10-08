import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';
import { EVENT_STATUS } from '../constants/eventStatus.js';
import { EVENT_TYPES } from '../constants/eventTypes.js';

const eventRequestSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        phone: { type: String, required: [true, 'Phone is required'], trim: true },
        eventType: {
            type: String,
            required: [true, 'Event type is required'],
            enum: EVENT_TYPES
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD']
        },
        guests: { type: Number, required: [true, 'Guests is required'], min: 1 },
        message: { type: String, default: '' },
        status: {
            type: String,
            enum: Object.values(EVENT_STATUS),
            default: EVENT_STATUS.NEW
        }
    },
    makeSchemaOptions()
);

export default mongoose.model('EventRequest', eventRequestSchema);