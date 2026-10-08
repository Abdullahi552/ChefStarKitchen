import 'dotenv/config';

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { ROLES } from '../constants/roles.js';

const seedAdmin = async () => {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL;
        const existing = await User.findOne({ email });

        if (existing) {
            console.log(`ℹ️  Admin already exists: ${email}`);
            process.exit(0);
        }

        const admin = await User.create({
            name: process.env.ADMIN_NAME,
            email,
            phone: process.env.ADMIN_PHONE,
            password: process.env.ADMIN_PASSWORD,
            role: ROLES.ADMIN,
            title: 'Master Chef'
        });

        console.log(`✅ Admin created: ${admin.email}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedAdmin();