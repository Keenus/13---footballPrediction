import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import './config/env';
import endpointsRouter from './endpoints/endpoints';
import { handleStripeWebhook } from './endpoints/payments/webhook.handler';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:4200', 'http://localhost:4000', 'http://localhost:3000', 'http://localhost:3001']
    : [process.env.APP_URL || 'http://localhost:4200'],
  credentials: true,
}));

// Stripe webhook needs raw body — must be before bodyParser.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api', endpointsRouter);

const port = parseInt(process.env.PORT || '3001', 10);

app.listen(port, () => {
  console.log(`Football Prediction API running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
