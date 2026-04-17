import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { getStripe, isStripeConfigured } from '../../config/stripe';

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!isStripeConfigured()) {
    res.status(400).json({ error: 'Stripe not configured' });
    return;
  }

  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      case 'invoice.payment_failed': {
        await handlePaymentFailed(event.data.object);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : null;
  const planId = session.metadata?.planId ? parseInt(session.metadata.planId, 10) : null;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  await prisma.payments.updateMany({
    where: { stripe_session_id: session.id },
    data: {
      status: 'completed',
      stripe_payment_intent_id: (session.payment_intent as string) || null,
    },
  });

  const subscriptionId = session.subscription as string;

  await prisma.users.update({
    where: { id: userId },
    data: {
      subscription_plan_id: planId,
      stripe_subscription_id: subscriptionId || null,
    },
  });

  console.log(`User ${userId} upgraded to plan ${planId}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const user = await prisma.users.findFirst({
    where: { stripe_subscription_id: subscription.id },
  });

  if (!user) return;

  const lightPlan = await prisma.subscription_plans.findFirst({
    where: { name: 'light' },
  });

  await prisma.users.update({
    where: { id: user.id },
    data: {
      subscription_plan_id: lightPlan?.id || null,
      stripe_subscription_id: null,
      subscription_expires_at: null,
    },
  });

  console.log(`User ${user.id} downgraded to Light (subscription deleted)`);
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const user = await prisma.users.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (user) {
    console.warn(`Payment failed for user ${user.id} (${user.email})`);
  }
}
