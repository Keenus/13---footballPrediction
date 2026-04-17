import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember } from '../../middleware/league-access.middleware';

const router = Router({ mergeParams: true });

router.get('/', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const competitionId = req.query.competitionId ? parseInt(req.query.competitionId as string, 10) : null;

    const leagueComps = await prisma.league_competitions.findMany({
      where: {
        league_id: leagueId,
        ...(competitionId ? { competition_id: competitionId } : {}),
      },
    });

    if (leagueComps.length === 0) {
      res.json([]);
      return;
    }

    const compIds = leagueComps.map((lc) => lc.competition_id);

    const rounds = await prisma.rounds.findMany({
      where: { competition_id: { in: compIds }, is_completed: true },
      orderBy: { number: 'desc' },
      include: {
        competition: { select: { id: true, name: true } },
        matches: {
          include: {
            home_team: { select: { id: true, name: true } },
            away_team: { select: { id: true, name: true } },
          },
        },
      },
    });

    const matchIds = rounds.flatMap((r) => r.matches.map((m) => m.id));

    const userPredictions = await prisma.predictions.findMany({
      where: {
        user_id: req.user!.userId,
        league_id: leagueId,
        match_id: { in: matchIds },
      },
    });

    const predMap: Record<number, { homeScore: number | null; awayScore: number | null; pointsEarned: number }> = {};
    for (const p of userPredictions) {
      predMap[p.match_id] = {
        homeScore: p.home_score,
        awayScore: p.away_score,
        pointsEarned: p.points_earned,
      };
    }

    const history = rounds.map((round) => ({
      id: round.id,
      number: round.number,
      name: round.name,
      competitionId: round.competition.id,
      competitionName: round.competition.name,
      roundPoints: round.matches.reduce((sum, m) => sum + (predMap[m.id]?.pointsEarned || 0), 0),
      matches: round.matches.map((m) => ({
        id: m.id,
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        homeScore: m.home_score,
        awayScore: m.away_score,
        prediction: predMap[m.id] || null,
      })),
    }));

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
