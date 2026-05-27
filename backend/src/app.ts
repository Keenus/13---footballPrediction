import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import './config/env';
import endpointsRouter from './endpoints/endpoints';
import { handleStripeWebhook } from './endpoints/payments/webhook.handler';
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = process.env.NODE_ENV === 'development'
    ? ['http://localhost:4200', 'http://localhost:4000', 'http://localhost:3000', 'http://localhost:3001']
    : [process.env.APP_URL!, /\.vercel\.app$/];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Stripe webhook needs raw body — must be before bodyParser.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// PO zmianie:
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api', endpointsRouter);

const port = parseInt(process.env.PORT || '3001', 10);

const server = app.listen(port, () => {
  console.log(`Football Prediction API running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});