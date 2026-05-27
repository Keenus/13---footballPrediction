import * as path from 'path';
import * as dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

if (process.env.NODE_ENV === 'production' && !process.env.APP_URL) {
    throw new Error('APP_URL is required in production');
}

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
}

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is required in production');
}

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required');
}