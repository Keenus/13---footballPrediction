import { Router } from 'express';

import authRouter from './auth/auth.routes';
import usersRouter from './users/users.routes';
import plansRouter from './subscription-plans/plans.routes';
import leaguesRouter from './leagues/leagues.routes';
import roundsRouter from './rounds/rounds.routes';
import predictionsRouter from './predictions/predictions.routes';
import rankingRouter from './ranking/ranking.routes';
import tableRouter from './table/table.routes';
import historyRouter from './history/history.routes';
import scoringRouter from './scoring/scoring.routes';
import paymentsRouter from './payments/payments.routes';
import competitionsRouter from './competitions/competitions.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/subscription-plans', plansRouter);
router.use('/competitions', competitionsRouter);
router.use('/leagues', leaguesRouter);
router.use('/leagues/:leagueId/rounds', roundsRouter);
router.use('/leagues/:leagueId/predictions', predictionsRouter);
router.use('/leagues/:leagueId/ranking', rankingRouter);
router.use('/leagues/:leagueId/table', tableRouter);
router.use('/leagues/:leagueId/history', historyRouter);
router.use('/leagues/:leagueId/scoring', scoringRouter);
router.use('/payments', paymentsRouter);

export default router;
