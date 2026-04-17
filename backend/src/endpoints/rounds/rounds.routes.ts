import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember, requireLeagueOwner } from '../../middleware/league-access.middleware';

const router = Router({ mergeParams: true });

router.get('/', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const leagueComps = await prisma.league_competitions.findMany({
      where: { league_id: leagueId },
      include: {
        competition: {
          include: {
            rounds: {
              orderBy: { number: 'asc' },
              select: { id: true, number: true, name: true, is_completed: true },
            },
          },
        },
      },
    });

    const result = leagueComps.map((lc) => ({
      competitionId: lc.competition_id,
      competitionName: lc.competition.name,
      currentRoundIndex: lc.current_round_index,
      rounds: lc.competition.rounds,
    }));

    res.json(result);
  } catch (error) {
    console.error('List rounds error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/current', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
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
      res.status(404).json({ error: 'Brak rozgrywek w tej lidze' });
      return;
    }

    const lc = leagueComps[0];

    const competition = await prisma.competitions.findUnique({
      where: { id: lc.competition_id },
      include: { teams: true },
    });

    if (!competition) {
      res.status(404).json({ error: 'Rozgrywki nie znalezione' });
      return;
    }

    const round = await prisma.rounds.findFirst({
      where: { competition_id: lc.competition_id, number: lc.current_round_index + 1 },
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
      res.json({ round: null, isFinished: competition.is_finished, competitionId: lc.competition_id });
      return;
    }

    const userPredictions = await prisma.predictions.findMany({
      where: {
        user_id: req.user!.userId,
        league_id: leagueId,
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

    const now = new Date();

    res.json({
      competitionId: lc.competition_id,
      competitionName: competition.name,
      round: {
        id: round.id,
        number: round.number,
        name: round.name,
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
      },
      isFinished: competition.is_finished,
      currentRoundIndex: lc.current_round_index,
      totalRounds: await prisma.rounds.count({ where: { competition_id: lc.competition_id } }),
    });
  } catch (error) {
    console.error('Get current round error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/next', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const competitionId = req.body.competitionId ? parseInt(req.body.competitionId, 10) : null;

    const leagueComps = await prisma.league_competitions.findMany({
      where: {
        league_id: leagueId,
        ...(competitionId ? { competition_id: competitionId } : {}),
      },
    });

    if (leagueComps.length === 0) {
      res.status(404).json({ error: 'Brak rozgrywek w tej lidze' });
      return;
    }

    const lc = leagueComps[0];

    const totalRounds = await prisma.rounds.count({ where: { competition_id: lc.competition_id } });

    if (lc.current_round_index + 1 >= totalRounds) {
      res.status(400).json({ error: 'To była ostatnia kolejka' });
      return;
    }

    const updated = await prisma.league_competitions.update({
      where: { id: lc.id },
      data: { current_round_index: lc.current_round_index + 1 },
    });

    res.json({
      currentRoundIndex: updated.current_round_index,
      competitionId: lc.competition_id,
      message: 'Przejście do następnej kolejki',
    });
  } catch (error) {
    console.error('Next round error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
