import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/user.routes.js'
import errorMiddleware from './middleware/error.middleware.js';
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import contactRoutes from './routes/contact.routes.js'
import chartRoutes from './routes/chart.routes.js'

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://lms-frontend-jade-ten.vercel.app',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/ping', (req, res) => res.send('Pong'));
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/doubt', chartRoutes);

app.use((req, res) => {
    res.status(404).send('OOPS !! 404 PAGE NOT FOUND');
});

app.use(errorMiddleware);

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;