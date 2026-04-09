import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      include: { subscription_plan: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Nie znaleziono użytkownika' });
      return;
    }

    const totalPoints = await prisma.league_members.aggregate({
      where: { user_id: user.id },
      _sum: { total_points: true },
    });

    const predictions = await prisma.predictions.findMany({
      where: { user_id: user.id, points_earned: { gt: 0 } },
      include: { match: true },
    });

    let exactScores = 0;
    let correctResults = 0;
    for (const pred of predictions) {
      if (pred.home_score === pred.match.home_score && pred.away_score === pred.match.away_score) {
        exactScores++;
      } else {
        correctResults++;
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      subscriptionPlan: user.subscription_plan,
      stats: {
        totalPoints: totalPoints._sum.total_points || 0,
        exactScores,
        correctResults,
      },
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { username, avatar } = req.body;
    const data: any = {};
    if (username) data.username = username;
    if (avatar) data.avatar = avatar;

    const user = await prisma.users.update({
      where: { id: req.user!.userId },
      data,
      include: { subscription_plan: true },
    });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      subscriptionPlan: user.subscription_plan,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/', authenticateToken, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      include: { subscription_plan: true },
      orderBy: { created_at: 'desc' },
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        avatar: u.avatar,
        role: u.role,
        subscriptionPlan: u.subscription_plan,
        createdAt: u.created_at,
      }))
    );
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/:id/role', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      res.status(400).json({ error: 'Nieprawidłowa rola' });
      return;
    }

    const user = await prisma.users.update({
      where: { id: userId },
      data: { role },
    });

    res.json({ id: user.id, role: user.role });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/:id/subscription', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { subscriptionPlanId } = req.body;

    const plan = await prisma.subscription_plans.findUnique({ where: { id: subscriptionPlanId } });
    if (!plan) {
      res.status(404).json({ error: 'Plan nie istnieje' });
      return;
    }

    const user = await prisma.users.update({
      where: { id: userId },
      data: { subscription_plan_id: subscriptionPlanId },
      include: { subscription_plan: true },
    });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      subscriptionPlan: user.subscription_plan,
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
