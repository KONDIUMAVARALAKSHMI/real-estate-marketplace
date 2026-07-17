import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import listingRoute from './routes/listing.route.js';
import { createError } from './utils/error.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      
      if (isLocalhost || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Real Estate Marketplace API is running',
  });
});

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/listing', listingRoute);

app.use((_req, _res, next) => {
  next(createError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;

