import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export function requireLeagueMember(paramName = 'leagueId') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    if (req.user.role === 'admin') {
      next();
      return;
    }

    const leagueId = parseInt(req.params[paramName], 10);
    if (isNaN(leagueId)) {
      res.status(400).json({ error: 'Nieprawidłowe ID ligi' });
      return;
    }

    const membership = await prisma.league_members.findUnique({
      where: {
        league_id_user_id: {
          league_id: leagueId,
          user_id: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'Nie jesteś członkiem tej ligi' });
      return;
    }

    next();
  };
}

export function requireLeagueOwner(paramName = 'leagueId') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    if (req.user.role === 'admin') {
      next();
      return;
    }

    const leagueId = parseInt(req.params[paramName], 10);
    if (isNaN(leagueId)) {
      res.status(400).json({ error: 'Nieprawidłowe ID ligi' });
      return;
    }

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
    });

    if (!league || league.owner_id !== req.user.userId) {
      res.status(403).json({ error: 'Tylko właściciel ligi może wykonać tę operację' });
      return;
    }

    next();
  };
}
