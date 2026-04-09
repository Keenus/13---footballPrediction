import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Round } from '../models/round.model';
import { Match } from '../models/match.model';
import { Team } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private storage = inject(StorageService);

  generateSchedule(teams: Team[]): Round[] {
    const rounds: Round[] = [];
    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    let teamIds = teams.map(t => t.id);

    for (let round = 0; round < numRounds; round++) {
      const matches: Match[] = [];
      for (let match = 0; match < matchesPerRound; match++) {
        const home = teamIds[match];
        const away = teamIds[numTeams - 1 - match];
        
        const isHome = match === 0 && round % 2 === 0;
        
        matches.push({
          id: `r${round+1}m${match+1}`,
          homeTeamId: isHome ? away : home,
          awayTeamId: isHome ? home : away,
          homeScore: null,
          awayScore: null,
          isPlayed: false
        });
      }
      rounds.push({
        id: `r${round+1}`,
        number: round + 1,
        matches,
        isCompleted: false
      });

      teamIds = [teamIds[0], teamIds[numTeams - 1], ...teamIds.slice(1, numTeams - 1)];
    }

    return rounds;
  }
}
