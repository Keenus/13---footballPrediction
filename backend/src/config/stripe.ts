import Stripe from 'stripe';

let stripe: InstanceType<typeof Stripe> | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): InstanceType<typeof Stripe> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return stripe !== null;
}