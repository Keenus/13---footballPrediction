export interface ScheduleMatch {
  homeTeamId: number;
  awayTeamId: number;
}

export interface ScheduleRound {
  number: number;
  matches: ScheduleMatch[];
}

export function generateRoundRobinSchedule(teamIds: number[]): ScheduleRound[] {
  const rounds: ScheduleRound[] = [];
  const numTeams = teamIds.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const ids = [...teamIds];

  for (let round = 0; round < numRounds; round++) {
    const matches: ScheduleMatch[] = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const home = ids[match];
      const away = ids[numTeams - 1 - match];

      const isHome = match === 0 && round % 2 === 0;

      matches.push({
        homeTeamId: isHome ? away : home,
        awayTeamId: isHome ? home : away,
      });
    }
    rounds.push({ number: round + 1, matches });

    ids.splice(1, 0, ids.pop()!);
  }

  return rounds;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
