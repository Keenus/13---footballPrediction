import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember } from '../../middleware/league-access.middleware';

const router = Router({ mergeParams: true });

router.get('/:roundId', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const roundId = parseInt(req.params.roundId, 10);

    const round = await prisma.rounds.findUnique({
      where: { id: roundId },
      include: {
        matches: {
          include: { home_team: true, away_team: true },
        },
      },
    });

    if (!round) {
      res.status(404).json({ error: 'Kolejka nie znaleziona' });
      return;
    }

    const predictions = await prisma.predictions.findMany({
      where: {
        user_id: req.user!.userId,
        league_id: leagueId,
        match_id: { in: round.matches.map((m) => m.id) },
      },
    });

    const predictionsMap: Record<number, any> = {};
    for (const p of predictions) {
      predictionsMap[p.match_id] = {
        homeScore: p.home_score,
        awayScore: p.away_score,
        pointsEarned: p.points_earned,
      };
    }

    const now = new Date();

    res.json({
      roundId: round.id,
      roundNumber: round.number,
      roundName: round.name,
      isCompleted: round.is_completed,
      matches: round.matches.map((m) => {
        const deadline = m.deadline ? new Date(m.deadline) : null;
        const deadlinePassed = deadline ? now >= new Date(deadline.getTime() - 15 * 60 * 1000) : false;

        return {
          id: m.id,
          homeTeam: { id: m.home_team.id, name: m.home_team.name },
          awayTeam: { id: m.away_team.id, name: m.away_team.name },
          homeScore: m.home_score,
          awayScore: m.away_score,
          isPlayed: m.is_played,
          deadline: m.deadline,
          deadlinePassed,
          prediction: predictionsMap[m.id] || null,
        };
      }),
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/:roundId', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const roundId = parseInt(req.params.roundId, 10);
    const { predictions } = req.body;

    if (!predictions || !Array.isArray(predictions)) {
      res.status(400).json({ error: 'Tablica predictions jest wymagana' });
      return;
    }

    const round = await prisma.rounds.findUnique({
      where: { id: roundId },
      include: { matches: true },
    });

    if (!round) {
      res.status(404).json({ error: 'Kolejka nie znaleziona' });
      return;
    }

    if (round.is_completed) {
      res.status(400).json({ error: 'Nie można typować po rozegraniu kolejki' });
      return;
    }

    const now = new Date();
    const matchMap = new Map(round.matches.map((m) => [m.id, m]));

    await prisma.$transaction(async (tx) => {
      for (const pred of predictions) {
        const match = matchMap.get(pred.matchId);
        if (!match) continue;

        if (match.deadline) {
          const cutoff = new Date(new Date(match.deadline).getTime() - 15 * 60 * 1000);
          if (now >= cutoff) continue;
        }

        await tx.predictions.upsert({
          where: {
            match_id_user_id_league_id: {
              match_id: pred.matchId,
              user_id: req.user!.userId,
              league_id: leagueId,
            },
          },
          create: {
            match_id: pred.matchId,
            user_id: req.user!.userId,
            league_id: leagueId,
            home_score: pred.homeScore ?? null,
            away_score: pred.awayScore ?? null,
          },
          update: {
            home_score: pred.homeScore ?? null,
            away_score: pred.awayScore ?? null,
          },
        });
      }
    });

    res.json({ message: 'Typy zapisane' });
  } catch (error) {
    console.error('Save predictions error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
