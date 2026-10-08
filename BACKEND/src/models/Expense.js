import mongoose from 'mongoose';
import { makeSchemaOptions } from '../utils/schemaOptions.js';

const expenseSchema = new mongoose.Schema(
    {
        trackerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tracker',
            required: [true, 'Tracker is required']
        },
        title: { type: String, required: [true, 'Title is required'], trim: true },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than zero']
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD']
        },
        note: { type: String, default: '' },
        receipt: { type: String, default: '' }
    },
    makeSchemaOptions()
);

export default mongoose.model('Expense', expenseSchema);