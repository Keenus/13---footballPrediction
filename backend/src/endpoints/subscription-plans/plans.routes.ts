import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.subscription_plans.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    console.error('List plans error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
