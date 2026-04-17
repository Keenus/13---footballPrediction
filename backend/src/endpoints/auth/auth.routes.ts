import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, hasło i nazwa użytkownika są wymagane' });
      return;
    }

    if (username.length < 5) {
      res.status(400).json({ error: 'Nazwa użytkownika musi mieć minimum 5 znaków' });
      return;
    }

    const passwordErrors: string[] = [];
    if (password.length < 8) passwordErrors.push('minimum 8 znaków');
    if (!/[A-Z]/.test(password)) passwordErrors.push('wielką literę');
    if (!/[a-z]/.test(password)) passwordErrors.push('małą literę');
    if (!/[0-9]/.test(password)) passwordErrors.push('cyfrę');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) passwordErrors.push('znak specjalny');

    if (passwordErrors.length > 0) {
      res.status(400).json({ error: `Hasło musi zawierać: ${passwordErrors.join(', ')}` });
      return;
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Użytkownik z tym emailem już istnieje' });
      return;
    }

    const lightPlan = await prisma.subscription_plans.findFirst({
      where: { name: 'light' },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        username,
        subscription_plan_id: lightPlan?.id || null,
      },
      include: { subscription_plan: true },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        subscriptionPlan: user.subscription_plan,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email i hasło są wymagane' });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { subscription_plan: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        subscriptionPlan: user.subscription_plan,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      include: { subscription_plan: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      return;
    }

    const memberships = await prisma.league_members.findMany({
      where: { user_id: user.id },
      include: {
        league: { select: { id: true, name: true, is_finished: true } },
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      subscriptionPlan: user.subscription_plan,
      leagueCount: memberships.length,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
