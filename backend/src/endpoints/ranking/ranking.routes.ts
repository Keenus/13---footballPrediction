import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember } from '../../middleware/league-access.middleware';
import { filterRankingBySubscription } from '../../middleware/subscription.middleware';

const router = Router({ mergeParams: true });

router.get('/', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const members = await prisma.league_members.findMany({
      where: { league_id: leagueId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { total_points: 'desc' },
    });

    const fullRanking = members.map((m, index) => ({
      position: index + 1,
      user_id: m.user.id,
      username: m.user.username,
      avatar: m.user.avatar,
      totalPoints: m.total_points,
      isUser: m.user.id === req.user!.userId,
      role: m.role,
    }));

    const { ranking, isLimited } = filterRankingBySubscription(fullRanking, req.user!);

    res.json({ ranking, isLimited });
  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
