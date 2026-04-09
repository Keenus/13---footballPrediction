export interface ScoringConfig {
  exact_score_points: number;
  correct_difference_points: number;
  correct_result_points: number;
  wrong_points: number;
}

export const DEFAULT_SCORING: ScoringConfig = {
  exact_score_points: 3,
  correct_difference_points: 2,
  correct_result_points: 1,
  wrong_points: 0,
};

export function calculatePoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  config: ScoringConfig = DEFAULT_SCORING
): number {
  if (predHome === actualHome && predAway === actualAway) {
    return config.exact_score_points;
  }

  const predDiff = predHome - predAway;
  const actualDiff = actualHome - actualAway;

  if (predDiff === actualDiff) {
    return config.correct_difference_points;
  }

  const predWinner = predHome > predAway ? 1 : predHome < predAway ? -1 : 0;
  const actualWinner = actualHome > actualAway ? 1 : actualHome < actualAway ? -1 : 0;

  if (predWinner === actualWinner) {
    return config.correct_result_points;
  }

  return config.wrong_points;
}

export function generateScore(): number {
  const rand = Math.random();
  if (rand < 0.25) return 0;
  if (rand < 0.50) return 1;
  if (rand < 0.75) return 2;
  if (rand < 0.90) return 3;
  if (rand < 0.97) return 4;
  return 5;
}
