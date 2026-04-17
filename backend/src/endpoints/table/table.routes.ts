import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember } from '../../middleware/league-access.middleware';
import { filterTableBySubscription } from '../../middleware/subscription.middleware';

const router = Router({ mergeParams: true });

interface TableRow {
  teamId: number;
  teamName: string;
  matchesPlayed: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

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
      res.json({ table: [], isLimited: false });
      return;
    }

    const compId = leagueComps[0].competition_id;

    const teams = await prisma.teams.findMany({
      where: { competition_id: compId },
    });

    const matches = await prisma.matches.findMany({
      where: {
        is_played: true,
        round: { competition_id: compId },
      },
    });

    const rows: Record<number, TableRow> = {};
    for (const team of teams) {
      rows[team.id] = {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    }

    for (const match of matches) {
      if (match.home_score === null || match.away_score === null) continue;

      const home = rows[match.home_team_id];
      const away = rows[match.away_team_id];
      if (!home || !away) continue;

      home.matchesPlayed++;
      away.matchesPlayed++;
      home.goalsFor += match.home_score;
      home.goalsAgainst += match.away_score;
      away.goalsFor += match.away_score;
      away.goalsAgainst += match.home_score;

      if (match.home_score > match.away_score) {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (match.home_score < match.away_score) {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    }

    const sorted = Object.values(rows).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const { table, isLimited } = filterTableBySubscription(sorted, req.user!);

    res.json({ table, isLimited, competitionId: compId });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
