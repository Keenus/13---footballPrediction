import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { getStripe, isStripeConfigured } from '../../config/stripe';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  res.json({ configured: isStripeConfigured() });
});

router.post('/create-checkout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { planId } = req.body;
    const userId = req.user!.userId;

    const plan = await prisma.subscription_plans.findUnique({ where: { id: planId } });
    if (!plan) {
      res.status(404).json({ error: 'Plan nie istnieje' });
      return;
    }

    if (plan.name === 'light') {
      res.status(400).json({ error: 'Plan Light jest darmowy' });
      return;
    }

    if (!plan.stripe_price_id) {
      res.status(400).json({ error: 'Plan nie ma skonfigurowanej ceny w Stripe. Uruchom setup.' });
      return;
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      return;
    }

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
      await prisma.users.update({
        where: { id: userId },
        data: { stripe_customer_id: customerId },
      });
    }

    if (user.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(user.stripe_subscription_id);
      } catch {
        // old subscription may already be canceled
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cancel`,
      metadata: {
        userId: String(userId),
        planId: String(planId),
      },
    });

    await prisma.payments.create({
      data: {
        user_id: userId,
        subscription_plan_id: planId,
        stripe_session_id: session.id,
        amount: plan.price,
        currency: 'pln',
        status: 'pending',
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: error.message || 'Błąd serwera' });
  }
});

router.post('/create-portal', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const userId = req.user!.userId;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user?.stripe_customer_id) {
      res.status(400).json({ error: 'Nie masz aktywnej subskrypcji Stripe' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${frontendUrl}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: error.message || 'Błąd serwera' });
  }
});

router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payments.findMany({
      where: { user_id: req.user!.userId },
      include: { subscription_plan: true },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    res.json(payments.map(p => ({
      id: p.id,
      plan: p.subscription_plan.display_name,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.created_at,
    })));
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/setup-stripe', authenticateToken, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const stripe = getStripe();

    const plans = await prisma.subscription_plans.findMany({
      where: { is_active: true, name: { not: 'light' } },
    });

    const results: { name: string; priceId: string }[] = [];

    for (const plan of plans) {
      if (plan.stripe_price_id) {
        results.push({ name: plan.name, priceId: plan.stripe_price_id });
        continue;
      }

      const product = await stripe.products.create({
        name: `Football Prediction - ${plan.display_name}`,
        description: `Pakiet ${plan.display_name} - subskrypcja miesięczna`,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(plan.price) * 100),
        currency: 'pln',
        recurring: { interval: 'month' },
      });

      await prisma.subscription_plans.update({
        where: { id: plan.id },
        data: { stripe_price_id: price.id },
      });

      results.push({ name: plan.name, priceId: price.id });
    }

    res.json({ message: 'Stripe products and prices created', results });
  } catch (error: any) {
    console.error('Setup stripe error:', error);
    res.status(500).json({ error: error.message || 'Błąd serwera' });
  }
});

export default router;
