import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireLeagueMember, requireLeagueOwner } from '../../middleware/league-access.middleware';

const router = Router({ mergeParams: true });

router.get('/', authenticateToken, requireLeagueMember('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    const rules = await prisma.scoring_rules.findUnique({
      where: { league_id: leagueId },
    });

    if (!rules) {
      res.json({
        exact_score_points: 3,
        correct_difference_points: 2,
        correct_result_points: 1,
        wrong_points: 0,
      });
      return;
    }

    res.json({
      exact_score_points: rules.exact_score_points,
      correct_difference_points: rules.correct_difference_points,
      correct_result_points: rules.correct_result_points,
      wrong_points: rules.wrong_points,
    });
  } catch (error) {
    console.error('Get scoring rules error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.put('/', authenticateToken, requireLeagueOwner('leagueId'), async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);

    if (
      req.user!.role !== 'admin' &&
      (!req.user!.subscriptionPlan || !req.user!.subscriptionPlan.custom_scoring)
    ) {
      res.status(403).json({ error: 'Customowe zasady punktacji dostępne tylko w pakiecie Gold' });
      return;
    }

    const { exact_score_points, correct_difference_points, correct_result_points, wrong_points } = req.body;

    const rules = await prisma.scoring_rules.upsert({
      where: { league_id: leagueId },
      create: {
        league_id: leagueId,
        exact_score_points: exact_score_points ?? 3,
        correct_difference_points: correct_difference_points ?? 2,
        correct_result_points: correct_result_points ?? 1,
        wrong_points: wrong_points ?? 0,
      },
      update: {
        exact_score_points: exact_score_points ?? 3,
        correct_difference_points: correct_difference_points ?? 2,
        correct_result_points: correct_result_points ?? 1,
        wrong_points: wrong_points ?? 0,
      },
    });

    res.json({
      exact_score_points: rules.exact_score_points,
      correct_difference_points: rules.correct_difference_points,
      correct_result_points: rules.correct_result_points,
      wrong_points: rules.wrong_points,
      message: 'Zasady punktacji zaktualizowane',
    });
  } catch (error) {
    console.error('Update scoring rules error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
