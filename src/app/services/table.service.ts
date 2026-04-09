import { Injectable, inject, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { LeagueTableRow } from '../models/league-table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  private storage = inject(StorageService);

  table = computed(() => {
    const activeLeague = this.storage.activeLeague();
    const teams = this.storage.state().teams;
    const rows: Record<string, LeagueTableRow> = {};

    teams.forEach(team => {
      rows[team.id] = {
        team, matchesPlayed: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
      };
    });

    if (activeLeague) {
      activeLeague.rounds.forEach(round => {
        round.matches.forEach(match => {
          if (match.isPlayed && match.homeScore !== null && match.awayScore !== null) {
            const home = rows[match.homeTeamId];
            const away = rows[match.awayTeamId];

            home.matchesPlayed++;
            away.matchesPlayed++;
            home.goalsFor += match.homeScore;
            home.goalsAgainst += match.awayScore;
            away.goalsFor += match.awayScore;
            away.goalsAgainst += match.homeScore;

            if (match.homeScore > match.awayScore) {
              home.won++;
              home.points += 3;
              away.lost++;
            } else if (match.homeScore < match.awayScore) {
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
        });
      });
    }

    return Object.values(rows).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  });
}
