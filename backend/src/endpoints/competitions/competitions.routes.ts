import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { calculatePoints, ScoringConfig, DEFAULT_SCORING } from '../../utils/scoring.util';

const router = Router();

router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const competitions = await prisma.competitions.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        teams: { select: { id: true, name: true } },
        rounds: {
          select: { id: true, number: true, name: true, is_completed: true },
          orderBy: { number: 'asc' },
        },
        _count: { select: { league_competitions: true } },
      },
    });

    res.json(competitions.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      season: c.season,
      isFinished: c.is_finished,
      createdAt: c.created_at,
      teams: c.teams,
      rounds: c.rounds,
      linkedLeaguesCount: c._count.league_competitions,
    })));
  } catch (error) {
    console.error('List competitions error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/:competitionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);

    const competition = await prisma.competitions.findUnique({
      where: { id: competitionId },
      include: {
        teams: { orderBy: { id: 'asc' } },
        rounds: {
          orderBy: { number: 'asc' },
          include: {
            matches: {
              include: {
                home_team: { select: { id: true, name: true } },
                away_team: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!competition) {
      res.status(404).json({ error: 'Rozgrywki nie znalezione' });
      return;
    }

    res.json({
      id: competition.id,
      name: competition.name,
      type: competition.type,
      season: competition.season,
      isFinished: competition.is_finished,
      createdAt: competition.created_at,
      teams: competition.teams,
      rounds: competition.rounds.map((r) => ({
        id: r.id,
        number: r.number,
        name: r.name,
        isCompleted: r.is_completed,
        matches: r.matches.map((m) => ({
          id: m.id,
          homeTeam: m.home_team,
          awayTeam: m.away_team,
          homeScore: m.home_score,
          awayScore: m.away_score,
          isPlayed: m.is_played,
        })),
      })),
    });
  } catch (error) {
    console.error('Get competition error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, type, season } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nazwa rozgrywek jest wymagana' });
      return;
    }

    const competition = await prisma.competitions.create({
      data: {
        name: name.trim(),
        type: type || 'tournament',
        season: season || null,
      },
    });

    res.status(201).json({
      id: competition.id,
      name: competition.name,
      type: competition.type,
      season: competition.season,
    });
  } catch (error) {
    console.error('Create competition error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/:competitionId', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const { name, type, season, isFinished } = req.body;

    const competition = await prisma.competitions.update({
      where: { id: competitionId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(season !== undefined && { season }),
        ...(isFinished !== undefined && { is_finished: isFinished }),
      },
    });

    res.json({
      id: competition.id,
      name: competition.name,
      type: competition.type,
      season: competition.season,
      isFinished: competition.is_finished,
    });
  } catch (error) {
    console.error('Update competition error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/:competitionId', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    await prisma.competitions.delete({ where: { id: competitionId } });
    res.json({ message: 'Rozgrywki usunięte' });
  } catch (error) {
    console.error('Delete competition error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Teams management ---

router.post('/:competitionId/teams', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const { teams } = req.body;

    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      res.status(400).json({ error: 'Lista drużyn jest wymagana' });
      return;
    }

    const competition = await prisma.competitions.findUnique({ where: { id: competitionId } });
    if (!competition) {
      res.status(404).json({ error: 'Rozgrywki nie znalezione' });
      return;
    }

    const created = await Promise.all(
      teams.map((name: string) =>
        prisma.teams.create({ data: { name: name.trim(), competition_id: competitionId } })
      )
    );

    res.status(201).json(created);
  } catch (error) {
    console.error('Add teams error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Individual team management ---

router.put('/:competitionId/teams/:teamId', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const teamId = parseInt(req.params.teamId, 10);
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nazwa drużyny jest wymagana' });
      return;
    }

    const team = await prisma.teams.findFirst({ where: { id: teamId, competition_id: competitionId } });
    if (!team) {
      res.status(404).json({ error: 'Drużyna nie znaleziona' });
      return;
    }

    const updated = await prisma.teams.update({ where: { id: teamId }, data: { name: name.trim() } });
    res.json(updated);
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/:competitionId/teams/:teamId', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const teamId = parseInt(req.params.teamId, 10);

    const team = await prisma.teams.findFirst({ where: { id: teamId, competition_id: competitionId } });
    if (!team) {
      res.status(404).json({ error: 'Drużyna nie znaleziona' });
      return;
    }

    await prisma.teams.delete({ where: { id: teamId } });
    res.json({ message: 'Drużyna usunięta' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Individual match management ---

async function getOrCreateDefaultRound(competitionId: number): Promise<number> {
  let round = await prisma.rounds.findFirst({
    where: { competition_id: competitionId },
    orderBy: { number: 'asc' },
  });

  if (!round) {
    round = await prisma.rounds.create({
      data: { competition_id: competitionId, number: 1, name: 'Mecze' },
    });
  }

  return round.id;
}

router.get('/:competitionId/matches', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);

    const matches = await prisma.matches.findMany({
      where: { round: { competition_id: competitionId } },
      include: {
        home_team: { select: { id: true, name: true } },
        away_team: { select: { id: true, name: true } },
        round: { select: { id: true, number: true, name: true } },
      },
      orderBy: [{ deadline: 'asc' }, { id: 'asc' }],
    });

    res.json(matches.map((m) => ({
      id: m.id,
      homeTeam: m.home_team,
      awayTeam: m.away_team,
      homeScore: m.home_score,
      awayScore: m.away_score,
      isPlayed: m.is_played,
      deadline: m.deadline,
      roundId: m.round_id,
      roundName: m.round.name,
    })));
  } catch (error) {
    console.error('List matches error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/:competitionId/matches', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const { homeTeamId, awayTeamId, deadline } = req.body;

    if (!homeTeamId || !awayTeamId) {
      res.status(400).json({ error: 'Obie drużyny są wymagane' });
      return;
    }

    if (homeTeamId === awayTeamId) {
      res.status(400).json({ error: 'Drużyny muszą być różne' });
      return;
    }

    const competition = await prisma.competitions.findUnique({
      where: { id: competitionId },
      include: { teams: true },
    });

    if (!competition) {
      res.status(404).json({ error: 'Rozgrywki nie znalezione' });
      return;
    }

    const teamIds = new Set(competition.teams.map((t) => t.id));
    if (!teamIds.has(homeTeamId) || !teamIds.has(awayTeamId)) {
      res.status(400).json({ error: 'Drużyna nie należy do tych rozgrywek' });
      return;
    }

    const roundId = await getOrCreateDefaultRound(competitionId);

    const match = await prisma.matches.create({
      data: {
        round_id: roundId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        home_team: { select: { id: true, name: true } },
        away_team: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      id: match.id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      homeScore: match.home_score,
      awayScore: match.away_score,
      isPlayed: match.is_played,
      deadline: match.deadline,
      roundId: match.round_id,
    });
  } catch (error) {
    console.error('Add match error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/:competitionId/matches/:matchId', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const matchId = parseInt(req.params.matchId, 10);
    const { homeTeamId, awayTeamId, deadline } = req.body;

    const match = await prisma.matches.findFirst({
      where: { id: matchId, round: { competition_id: competitionId } },
    });

    if (!match) {
      res.status(404).json({ error: 'Mecz nie znaleziony' });
      return;
    }

    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      res.status(400).json({ error: 'Drużyny muszą być różne' });
      return;
    }

    const updated = await prisma.matches.update({
      where: { id: matchId },
      data: {
        ...(homeTeamId !== undefined && { home_team_id: homeTeamId }),
        ...(awayTeamId !== undefined && { away_team_id: awayTeamId }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
      include: {
        home_team: { select: { id: true, name: true } },
        away_team: { select: { id: true, name: true } },
      },
    });

    res.json({
      id: updated.id,
      homeTeam: updated.home_team,
      awayTeam: updated.away_team,
      homeScore: updated.home_score,
      awayScore: updated.away_score,
      isPlayed: updated.is_played,
      deadline: updated.deadline,
      roundId: updated.round_id,
    });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/:competitionId/matches/:matchId', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const matchId = parseInt(req.params.matchId, 10);

    const match = await prisma.matches.findFirst({
      where: { id: matchId, round: { competition_id: competitionId } },
    });

    if (!match) {
      res.status(404).json({ error: 'Mecz nie znaleziony' });
      return;
    }

    await prisma.matches.delete({ where: { id: matchId } });
    res.json({ message: 'Mecz usunięty' });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// --- Rounds & matches management (legacy) ---

router.post('/:competitionId/rounds', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const { number, name, matches } = req.body;

    if (number === undefined) {
      res.status(400).json({ error: 'Numer rundy jest wymagany' });
      return;
    }

    const competition = await prisma.competitions.findUnique({
      where: { id: competitionId },
      include: { teams: true },
    });

    if (!competition) {
      res.status(404).json({ error: 'Rozgrywki nie znalezione' });
      return;
    }

    const teamIds = new Set(competition.teams.map((t) => t.id));

    const round = await prisma.$transaction(async (tx) => {
      const newRound = await tx.rounds.create({
        data: {
          competition_id: competitionId,
          number,
          name: name || null,
        },
      });

      if (matches && Array.isArray(matches)) {
        for (const m of matches) {
          if (!teamIds.has(m.homeTeamId) || !teamIds.has(m.awayTeamId)) {
            throw new Error(`Drużyna nie należy do tych rozgrywek`);
          }
          await tx.matches.create({
            data: {
              round_id: newRound.id,
              home_team_id: m.homeTeamId,
              away_team_id: m.awayTeamId,
            },
          });
        }
      }

      return newRound;
    });

    const fullRound = await prisma.rounds.findUnique({
      where: { id: round.id },
      include: {
        matches: {
          include: {
            home_team: { select: { id: true, name: true } },
            away_team: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.status(201).json(fullRound);
  } catch (error: any) {
    console.error('Add round error:', error);
    res.status(500).json({ error: error.message || 'Błąd serwera' });
  }
});

router.put('/:competitionId/rounds/:roundId/results', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const competitionId = parseInt(req.params.competitionId, 10);
    const roundId = parseInt(req.params.roundId, 10);
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
      res.status(400).json({ error: 'Lista wyników jest wymagana' });
      return;
    }

    const linkedLeagues = await prisma.league_competitions.findMany({
      where: { competition_id: competitionId },
      include: {
        league: { include: { scoring_rules: true } },
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const r of results) {
        await tx.matches.update({
          where: { id: r.matchId },
          data: {
            home_score: r.homeScore,
            away_score: r.awayScore,
            is_played: true,
          },
        });

        for (const lc of linkedLeagues) {
          const scoringConfig: ScoringConfig = lc.league.scoring_rules || DEFAULT_SCORING;

          const predictions = await tx.predictions.findMany({
            where: { match_id: r.matchId, league_id: lc.league_id },
          });

          for (const pred of predictions) {
            let points = 0;
            if (pred.home_score !== null && pred.away_score !== null) {
              points = calculatePoints(pred.home_score, pred.away_score, r.homeScore, r.awayScore, scoringConfig);
            }

            await tx.predictions.update({
              where: { id: pred.id },
              data: { points_earned: points },
            });

            await tx.league_members.updateMany({
              where: { league_id: lc.league_id, user_id: pred.user_id },
              data: { total_points: { increment: points } },
            });
          }
        }
      }

      const round = await tx.rounds.findUnique({
        where: { id: roundId },
        include: { matches: true },
      });

      if (round && round.matches.every((m) => m.is_played)) {
        await tx.rounds.update({
          where: { id: roundId },
          data: { is_completed: true },
        });

        for (const lc of linkedLeagues) {
          const totalRounds = await tx.rounds.count({ where: { competition_id: competitionId } });
          if (lc.current_round_index + 1 >= totalRounds) {
            await tx.league_competitions.update({
              where: { id: lc.id },
              data: { current_round_index: totalRounds - 1 },
            });
          }
        }
      }
    });

    res.json({ message: 'Wyniki zapisane i punkty naliczone' });
  } catch (error) {
    console.error('Update results error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
