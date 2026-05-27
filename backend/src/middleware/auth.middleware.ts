import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export interface AuthUser {
  userId: number;
  email: string;
  role: 'admin' | 'user';
  subscriptionPlan: {
    id: number;
    name: string;
    max_created_leagues: number | null;
    max_joined_leagues: number | null;
    can_create_leagues: boolean;
    full_statistics: boolean;
    custom_scoring: boolean;
  } | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const cookieToken: string | undefined = req.cookies?.token;
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;
  const token = cookieToken ?? headerToken;

  if (!token) {
    res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Nieprawidłowy token' });
      return;
    }

    try {
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
        include: { subscription_plan: true },
      });

      if (!user) {
        res.status(401).json({ error: 'Użytkownik nie istnieje' });
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscription_plan
          ? {
              id: user.subscription_plan.id,
              name: user.subscription_plan.name,
              max_created_leagues: user.subscription_plan.max_created_leagues,
              max_joined_leagues: user.subscription_plan.max_joined_leagues,
              can_create_leagues: user.subscription_plan.can_create_leagues,
              full_statistics: user.subscription_plan.full_statistics,
              custom_scoring: user.subscription_plan.custom_scoring,
            }
          : null,
      };

      next();
    } catch (error) {
      res.status(500).json({ error: 'Błąd serwera' });
    }
  });
}
