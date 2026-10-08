import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: { type: String, trim: true },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER
        },
        // Admin-only fields
        title: { type: String, trim: true },
        image: { type: String, trim: true, default: '' },
        // Google OAuth — user may not have a password
        googleId: { type: String, sparse: true, unique: true }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                // Frontend expects `id`, not `_id`
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                delete ret.googleId;
                return ret;
            }
        }
    }
);

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password on login
userSchema.methods.matchPassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;