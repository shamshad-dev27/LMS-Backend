import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import errorMiddleware from './middleware/error.middleware.js';
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import contactRoutes from './routes/contact.routes.js'
import chartRoutes from './routes/chart.routes.js'
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors({
    origin: [process.env.FRONTEND_URL] || 'ms-frontend-k1sa7qw1k-shamshad-dev27s-projects.vercel.app',
    credentials: true
}))
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// app.use(bodyParser.json({ limit: '500mb' }));

// app.use(bodyParser.urlencoded({
//     limit: '500mb',
//     extended: true,
//     parameterLimit: 50000
// }));

app.use(cookieParser());
app.use(morgan('dev'));
app.use('/ping', function (req, res) {
    res.send('Pong');
})
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/contact', contactRoutes);
console.log("Doubt route registered");
app.use('/api/v1/doubt', chartRoutes);
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
app.use(errorMiddleware);
app.use((req, res) => {
    res.status(404).send('OOPS !! 404 PAGE NOT FOUND');
})
export default app;