import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember } from '../../middleware/league-access.middleware';

const router = Router({ mergeParams: true });

router.get('/:roundId', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
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

    res.json({
      roundId: round.id,
      roundNumber: round.number,
      isCompleted: round.is_completed,
      matches: round.matches.map((m) => ({
        id: m.id,
        homeTeam: { id: m.home_team.id, name: m.home_team.name },
        awayTeam: { id: m.away_team.id, name: m.away_team.name },
        homeScore: m.home_score,
        awayScore: m.away_score,
        isPlayed: m.is_played,
        prediction: predictionsMap[m.id] || null,
      })),
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/:roundId', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
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

    const matchIds = round.matches.map((m) => m.id);

    await prisma.$transaction(async (tx) => {
      for (const pred of predictions) {
        if (!matchIds.includes(pred.matchId)) continue;

        await tx.predictions.upsert({
          where: {
            match_id_user_id: {
              match_id: pred.matchId,
              user_id: req.user!.userId,
            },
          },
          create: {
            match_id: pred.matchId,
            user_id: req.user!.userId,
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
