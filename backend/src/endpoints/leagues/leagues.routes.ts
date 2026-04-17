import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember, requireLeagueOwner } from '../../middleware/league-access.middleware';
import { checkCanCreateLeague, checkCanJoinLeague } from '../../middleware/subscription.middleware';
import { generateInviteCode } from '../../utils/schedule.util';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const memberships = await prisma.league_members.findMany({
      where: { user_id: req.user!.userId },
      include: {
        league: {
          include: {
            owner: { select: { id: true, username: true } },
            members: { select: { id: true } },
            league_competitions: {
              include: {
                competition: {
                  select: { id: true, name: true, type: true, season: true, is_finished: true },
                },
              },
            },
          },
        },
      },
    });

    const leagues = memberships.map((m) => ({
      id: m.league.id,
      name: m.league.name,
      ownerId: m.league.owner_id,
      ownerName: m.league.owner.username,
      inviteCode: m.league.invite_code,
      isFinished: m.league.is_finished,
      memberCount: m.league.members.length,
      competitions: m.league.league_competitions.map((lc) => ({
        id: lc.competition.id,
        name: lc.competition.name,
        type: lc.competition.type,
        season: lc.competition.season,
        isFinished: lc.competition.is_finished,
        currentRoundIndex: lc.current_round_index,
      })),
      myRole: m.role,
      myPoints: m.total_points,
      isOwner: m.league.owner_id === req.user!.userId,
    }));

    res.json(leagues);
  } catch (error) {
    console.error('List leagues error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/:leagueId', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
          orderBy: { total_points: 'desc' },
        },
        league_competitions: {
          include: {
            competition: {
              include: {
                teams: { orderBy: { id: 'asc' } },
                rounds: {
                  orderBy: { number: 'asc' },
                  select: { id: true, number: true, name: true, is_completed: true },
                },
              },
            },
          },
        },
        scoring_rules: true,
      },
    });

    if (!league) {
      res.status(404).json({ error: 'Liga nie znaleziona' });
      return;
    }

    res.json({
      id: league.id,
      name: league.name,
      owner: league.owner,
      inviteCode: league.invite_code,
      isFinished: league.is_finished,
      members: league.members.map((m) => ({
        userId: m.user.id,
        username: m.user.username,
        avatar: m.user.avatar,
        role: m.role,
        totalPoints: m.total_points,
      })),
      competitions: league.league_competitions.map((lc) => ({
        id: lc.competition.id,
        name: lc.competition.name,
        currentRoundIndex: lc.current_round_index,
        teams: lc.competition.teams,
        rounds: lc.competition.rounds,
      })),
      scoringRules: league.scoring_rules,
      createdAt: league.created_at,
    });
  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/', authenticateToken, checkCanCreateLeague, async (req: Request, res: Response) => {
  try {
    const { name, competitionIds } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nazwa ligi jest wymagana' });
      return;
    }

    if (!competitionIds || !Array.isArray(competitionIds) || competitionIds.length === 0) {
      res.status(400).json({ error: 'Wybierz przynajmniej jedne rozgrywki' });
      return;
    }

    const competitions = await prisma.competitions.findMany({
      where: { id: { in: competitionIds } },
    });

    if (competitions.length !== competitionIds.length) {
      res.status(400).json({ error: 'Niektóre rozgrywki nie istnieją' });
      return;
    }

    let inviteCode = generateInviteCode();
    let tries = 0;
    while (tries < 10) {
      const existing = await prisma.leagues.findUnique({ where: { invite_code: inviteCode } });
      if (!existing) break;
      inviteCode = generateInviteCode();
      tries++;
    }

    const league = await prisma.$transaction(async (tx) => {
      const newLeague = await tx.leagues.create({
        data: {
          name: name.trim(),
          owner_id: req.user!.userId,
          invite_code: inviteCode,
        },
      });

      await tx.league_members.create({
        data: {
          league_id: newLeague.id,
          user_id: req.user!.userId,
          role: 'owner',
        },
      });

      for (const compId of competitionIds) {
        await tx.league_competitions.create({
          data: {
            league_id: newLeague.id,
            competition_id: compId,
          },
        });
      }

      await tx.scoring_rules.create({
        data: { league_id: newLeague.id },
      });

      return newLeague;
    });

    res.status(201).json({
      id: league.id,
      name: league.name,
      inviteCode: league.invite_code,
    });
  } catch (error) {
    console.error('Create league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/:leagueId/competitions', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const { competitionId } = req.body;

    if (!competitionId) {
      res.status(400).json({ error: 'ID rozgrywek jest wymagane' });
      return;
    }

    const competition = await prisma.competitions.findUnique({ where: { id: competitionId } });
    if (!competition) {
      res.status(404).json({ error: 'Rozgrywki nie znalezione' });
      return;
    }

    const existing = await prisma.league_competitions.findUnique({
      where: { league_id_competition_id: { league_id: leagueId, competition_id: competitionId } },
    });

    if (existing) {
      res.status(409).json({ error: 'Te rozgrywki są już dodane do ligi' });
      return;
    }

    await prisma.league_competitions.create({
      data: { league_id: leagueId, competition_id: competitionId },
    });

    res.json({ message: 'Rozgrywki dodane do ligi' });
  } catch (error) {
    console.error('Add competition to league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/:leagueId/competitions/:competitionId', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const competitionId = parseInt(req.params.competitionId, 10);

    await prisma.league_competitions.delete({
      where: { league_id_competition_id: { league_id: leagueId, competition_id: competitionId } },
    });

    res.json({ message: 'Rozgrywki usunięte z ligi' });
  } catch (error) {
    console.error('Remove competition from league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/join', authenticateToken, checkCanJoinLeague, async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      res.status(400).json({ error: 'Kod zaproszenia jest wymagany' });
      return;
    }

    const league = await prisma.leagues.findUnique({
      where: { invite_code: inviteCode },
      include: { members: true },
    });

    if (!league) {
      res.status(404).json({ error: 'Liga z tym kodem nie istnieje' });
      return;
    }

    const alreadyMember = league.members.find((m) => m.user_id === req.user!.userId);
    if (alreadyMember) {
      res.status(409).json({ error: 'Już jesteś członkiem tej ligi' });
      return;
    }

    if (league.is_finished) {
      res.status(400).json({ error: 'Ta liga jest już zakończona' });
      return;
    }

    await prisma.league_members.create({
      data: {
        league_id: league.id,
        user_id: req.user!.userId,
        role: 'member',
      },
    });

    res.json({
      id: league.id,
      name: league.name,
      message: 'Dołączyłeś do ligi',
    });
  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.post('/:leagueId/leave', authenticateToken, async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const league = await prisma.leagues.findUnique({ where: { id: leagueId } });
    if (!league) {
      res.status(404).json({ error: 'Liga nie znaleziona' });
      return;
    }

    if (league.owner_id === req.user!.userId) {
      res.status(400).json({ error: 'Właściciel nie może opuścić ligi. Musisz ją usunąć.' });
      return;
    }

    await prisma.league_members.delete({
      where: {
        league_id_user_id: {
          league_id: leagueId,
          user_id: req.user!.userId,
        },
      },
    });

    res.json({ message: 'Opuściłeś ligę' });
  } catch (error) {
    console.error('Leave league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.delete('/:leagueId', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    await prisma.leagues.delete({ where: { id: leagueId } });

    res.json({ message: 'Liga usunięta' });
  } catch (error) {
    console.error('Delete league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/:leagueId', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nazwa ligi jest wymagana' });
      return;
    }

    const league = await prisma.leagues.update({
      where: { id: leagueId },
      data: { name: name.trim() },
    });

    res.json({ id: league.id, name: league.name });
  } catch (error) {
    console.error('Update league error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/:leagueId/invite-code', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
      select: { invite_code: true },
    });

    if (!league) {
      res.status(404).json({ error: 'Liga nie znaleziona' });
      return;
    }

    res.json({ inviteCode: league.invite_code });
  } catch (error) {
    console.error('Get invite code error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
