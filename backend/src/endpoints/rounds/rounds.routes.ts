import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember, requireLeagueOwner } from '../../middleware/league-access.middleware';
import { calculatePoints, generateScore, ScoringConfig, DEFAULT_SCORING } from '../../utils/scoring.util';

const router = Router({ mergeParams: true });

router.get('/', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const rounds = await prisma.rounds.findMany({
      where: { league_id: leagueId },
      orderBy: { number: 'asc' },
      select: { id: true, number: true, is_completed: true },
    });

    res.json(rounds);
  } catch (error) {
    console.error('List rounds error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/current', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
      include: { teams: true },
    });

    if (!league) {
      res.status(404).json({ error: 'Liga nie znaleziona' });
      return;
    }

    const round = await prisma.rounds.findFirst({
      where: { league_id: leagueId, number: league.current_round_index + 1 },
      include: {
        matches: {
          include: {
            home_team: true,
            away_team: true,
          },
        },
      },
    });

    if (!round) {
      res.json({ round: null, isFinished: league.is_finished });
      return;
    }

    const userPredictions = await prisma.predictions.findMany({
      where: {
        user_id: req.user!.userId,
        match_id: { in: round.matches.map((m) => m.id) },
      },
    });

    const predictionsMap: Record<number, { homeScore: number | null; awayScore: number | null; pointsEarned: number }> = {};
    for (const p of userPredictions) {
      predictionsMap[p.match_id] = {
        homeScore: p.home_score,
        awayScore: p.away_score,
        pointsEarned: p.points_earned,
      };
    }

    res.json({
      round: {
        id: round.id,
        number: round.number,
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
      },
      isFinished: league.is_finished,
      currentRoundIndex: league.current_round_index,
      totalRounds: await prisma.rounds.count({ where: { league_id: leagueId } }),
    });
  } catch (error) {
    console.error('Get current round error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/simulate', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
      include: { scoring_rules: true },
    });

    if (!league) {
      res.status(404).json({ error: 'Liga nie znaleziona' });
      return;
    }

    if (league.is_finished) {
      res.status(400).json({ error: 'Liga jest już zakończona' });
      return;
    }

    const round = await prisma.rounds.findFirst({
      where: { league_id: leagueId, number: league.current_round_index + 1 },
      include: { matches: true },
    });

    if (!round) {
      res.status(400).json({ error: 'Brak kolejki do zasymulowania' });
      return;
    }

    if (round.is_completed) {
      res.status(400).json({ error: 'Ta kolejka została już rozegrana' });
      return;
    }

    const scoringConfig: ScoringConfig = league.scoring_rules || DEFAULT_SCORING;

    const members = await prisma.league_members.findMany({
      where: { league_id: leagueId },
    });

    await prisma.$transaction(async (tx) => {
      for (const match of round.matches) {
        const homeScore = generateScore();
        const awayScore = generateScore();

        await tx.matches.update({
          where: { id: match.id },
          data: { home_score: homeScore, away_score: awayScore, is_played: true },
        });

        const predictions = await tx.predictions.findMany({
          where: { match_id: match.id },
        });

        for (const pred of predictions) {
          let points = 0;
          if (pred.home_score !== null && pred.away_score !== null) {
            points = calculatePoints(pred.home_score, pred.away_score, homeScore, awayScore, scoringConfig);
          }

          await tx.predictions.update({
            where: { id: pred.id },
            data: { points_earned: points },
          });

          await tx.league_members.updateMany({
            where: { league_id: leagueId, user_id: pred.user_id },
            data: { total_points: { increment: points } },
          });
        }
      }

      await tx.rounds.update({
        where: { id: round.id },
        data: { is_completed: true },
      });

      const totalRounds = await tx.rounds.count({ where: { league_id: leagueId } });
      const isFinished = league.current_round_index + 1 >= totalRounds;

      if (isFinished) {
        await tx.leagues.update({
          where: { id: leagueId },
          data: { is_finished: true },
        });
      }
    });

    const updatedRound = await prisma.rounds.findUnique({
      where: { id: round.id },
      include: {
        matches: {
          include: { home_team: true, away_team: true },
        },
      },
    });

    const userPredictions = await prisma.predictions.findMany({
      where: {
        user_id: req.user!.userId,
        match_id: { in: round.matches.map((m) => m.id) },
      },
    });

    const roundPoints = userPredictions.reduce((sum, p) => sum + p.points_earned, 0);

    res.json({
      round: updatedRound,
      roundPoints,
      message: 'Kolejka zasymulowana',
    });
  } catch (error) {
    console.error('Simulate round error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/next', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const league = await prisma.leagues.findUnique({ where: { id: leagueId } });
    if (!league) {
      res.status(404).json({ error: 'Liga nie znaleziona' });
      return;
    }

    const totalRounds = await prisma.rounds.count({ where: { league_id: leagueId } });

    if (league.current_round_index + 1 >= totalRounds) {
      res.status(400).json({ error: 'To była ostatnia kolejka' });
      return;
    }

    const updated = await prisma.leagues.update({
      where: { id: leagueId },
      data: { current_round_index: league.current_round_index + 1 },
    });

    res.json({
      currentRoundIndex: updated.current_round_index,
      message: 'Przejście do następnej kolejki',
    });
  } catch (error) {
    console.error('Next round error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
