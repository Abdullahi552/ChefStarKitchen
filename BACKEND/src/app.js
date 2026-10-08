import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import eventRoutes from './routes/event.routes.js';
import AppError from './utils/AppError.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import menuRoutes from './routes/menu.routes.js';
import specialRoutes from './routes/special.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import chefRoutes from './routes/chef.routes.js';
import financeRoutes from './routes/finance.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';



const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// 3. Body parsing — preserve raw body for webhook signature verification
app.use(
    express.json({
        limit: '10mb',
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    })
);
app.use(express.urlencoded({ extended: true }));

// 4. Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 5. Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'ChefStar API',
        timestamp: new Date().toISOString()
    });
});

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/specials', specialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/uploads', uploadRoutes);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Override CORP only for /uploads so images can be embedded cross-origin
app.use(
    '/uploads',
    (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
    },
    express.static(path.join(__dirname, '..', 'uploads'))
);
// 7. 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// 8. Global error handler (must be last)
app.use(errorHandler);

export default app;