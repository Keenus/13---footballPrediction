import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

let stripe: InstanceType<typeof Stripe> | null = null;

if (secretKey && !secretKey.startsWith('sk_test_XXXX')) {
  stripe = new Stripe(secretKey);
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
