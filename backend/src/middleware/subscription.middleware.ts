import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthUser } from './auth.middleware';

export async function checkCanCreateLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Brak autoryzacji' });
    return;
  }

  if (req.user.role === 'admin') {
    next();
    return;
  }

  const plan = req.user.subscriptionPlan;
  if (!plan || !plan.can_create_leagues) {
    res.status(403).json({ error: 'Twój plan subskrypcji nie pozwala na tworzenie lig. Ulepsz do pakietu Standard lub Gold.' });
    return;
  }

  if (plan.max_created_leagues !== null) {
    const ownedCount = await prisma.leagues.count({
      where: { owner_id: req.user.userId },
    });

    if (ownedCount >= plan.max_created_leagues) {
      res.status(403).json({
        error: `Osiągnąłeś limit ${plan.max_created_leagues} stworzonych lig w planie ${plan.name}. Ulepsz swój plan, aby tworzyć więcej.`,
      });
      return;
    }
  }

  next();
}

export async function checkCanJoinLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Brak autoryzacji' });
    return;
  }

  if (req.user.role === 'admin') {
    next();
    return;
  }

  const plan = req.user.subscriptionPlan;
  if (!plan) {
    res.status(403).json({ error: 'Brak aktywnego planu subskrypcji' });
    return;
  }

  if (plan.max_joined_leagues !== null) {
    const joinedCount = await prisma.league_members.count({
      where: { user_id: req.user.userId },
    });

    if (joinedCount >= plan.max_joined_leagues) {
      res.status(403).json({
        error: `Osiągnąłeś limit ${plan.max_joined_leagues} lig w planie ${plan.name}. Ulepsz swój plan, aby dołączać do więcej.`,
      });
      return;
    }
  }

  next();
}

export function filterRankingBySubscription(ranking: any[], user: AuthUser): { ranking: any[]; isLimited: boolean } {
  if (user.role === 'admin' || (user.subscriptionPlan && user.subscriptionPlan.full_statistics)) {
    return { ranking, isLimited: false };
  }

  const top3 = ranking.slice(0, 3);
  const userEntry = ranking.find((r: any) => r.user_id === user.userId);
  const userPosition = ranking.findIndex((r: any) => r.user_id === user.userId) + 1;

  const limited = [...top3];
  if (userEntry && userPosition > 3) {
    limited.push({ ...userEntry, position: userPosition });
  }

  return { ranking: limited, isLimited: true };
}

export function filterTableBySubscription(table: any[], user: AuthUser): { table: any[]; isLimited: boolean } {
  if (user.role === 'admin' || (user.subscriptionPlan && user.subscriptionPlan.full_statistics)) {
    return { table, isLimited: false };
  }

  return { table: table.slice(0, 3), isLimited: true };
}
