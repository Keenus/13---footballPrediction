import { Injectable, signal, effect, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppState } from '../models/app-state.model';
import { Team } from '../models/team.model';
import { TyperLeague } from '../models/typer-league.model';
import { Round } from '../models/round.model';

const STORAGE_KEY = 'football_predictions_state';

const INITIAL_TEAMS: Team[] = [
  { id: 't1', name: 'Orły Warszawa' },
  { id: 't2', name: 'Wilki Kraków' },
  { id: 't3', name: 'Tygrysy Gdańsk' },
  { id: 't4', name: 'Rekiny Wrocław' },
  { id: 't5', name: 'Lwy Poznań' },
  { id: 't6', name: 'Sokoły Łódź' },
  { id: 't7', name: 'Pantery Szczecin' },
  { id: 't8', name: 'Jastrzębie Lublin' },
];

export interface UserStats {
  totalPoints: number;
  exactScores: number;
  correctResults: number;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  state = signal<AppState>(this.loadState());

  activeLeague = computed(() => {
    const s = this.state();
    return s.leagues.find(l => l.id === s.activeLeagueId) || null;
  });

  userStats = computed<UserStats>(() => {
    let totalPoints = 0;
    let exactScores = 0;
    let correctResults = 0;
    
    for (const league of this.state().leagues) {
      const userTipster = league.tipsters.find(t => t.id === 'user');
      if (userTipster) totalPoints += userTipster.points;
      
      for (const round of league.rounds) {
        if (!round.isCompleted) continue;
        for (const match of round.matches) {
          const pred = league.predictions[match.id];
          if (pred && pred.homeScore !== null && pred.awayScore !== null && match.homeScore !== null && match.awayScore !== null) {
            if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
              exactScores++;
            } else {
              const predDiff = pred.homeScore - pred.awayScore;
              const actualDiff = match.homeScore - match.awayScore;
              if ((predDiff > 0 && actualDiff > 0) || (predDiff < 0 && actualDiff < 0) || (predDiff === 0 && actualDiff === 0)) {
                correctResults++;
              }
            }
          }
        }
      }
    }
    return { totalPoints, exactScores, correctResults };
  });

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
      }
    });
  }

  private loadState(): AppState {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Migration from old state to new state with leagues
        if (!parsed.leagues) {
          const defaultLeague: TyperLeague = {
            id: 'league-default',
            name: 'Moja pierwsza liga',
            ownerId: 'user',
            rounds: parsed.rounds || [],
            predictions: parsed.predictions || {},
            currentRoundIndex: parsed.currentRoundIndex || 0,
            tipsters: parsed.tipsters || this.getInitialTipsters(),
            isFinished: parsed.rounds?.length > 0 && (parsed.currentRoundIndex || 0) >= parsed.rounds.length
          };
          return {
            teams: parsed.teams || INITIAL_TEAMS,
            leagues: parsed.rounds?.length > 0 ? [defaultLeague] : [],
            activeLeagueId: parsed.rounds?.length > 0 ? 'league-default' : null
          };
        } else {
          // Ensure all leagues have ownerId
          parsed.leagues = parsed.leagues.map((l: any) => ({
            ...l,
            ownerId: l.ownerId || 'user'
          }));
        }
        
        return parsed;
      }
    }
    return this.getInitialState();
  }

  private getInitialTipsters() {
    return [
      { id: 'user', name: 'Ty', points: 0, isUser: true, avatar: 'person' },
      { id: 'bot1', name: 'Janusz Futbolu', points: 0, isUser: false, avatar: 'sports_soccer' },
      { id: 'bot2', name: 'Ekspert TV', points: 0, isUser: false, avatar: 'smart_toy' }
    ];
  }

  getInitialState(): AppState {
    return {
      teams: INITIAL_TEAMS,
      leagues: [],
      activeLeagueId: null
    };
  }

  updateState(partial: Partial<AppState>) {
    this.state.update(s => ({ ...s, ...partial }));
  }

  createLeague(name: string, rounds: Round[], ownerId: string = 'user') {
    const s = this.state();
    
    const newLeague: TyperLeague = {
      id: 'league-' + Date.now(),
      name,
      ownerId,
      rounds,
      predictions: {},
      currentRoundIndex: 0,
      tipsters: this.getInitialTipsters(),
      isFinished: false
    };

    this.updateState({
      leagues: [...s.leagues, newLeague],
      activeLeagueId: newLeague.id
    });
  }

  joinMockLeague(name: string, rounds: Round[]) {
    this.createLeague(name, rounds, 'system');
  }

  setActiveLeague(id: string) {
    this.updateState({ activeLeagueId: id });
  }

  updateActiveLeague(partial: Partial<TyperLeague>) {
    const s = this.state();
    if (!s.activeLeagueId) return;

    const leagues = s.leagues.map(l => 
      l.id === s.activeLeagueId ? { ...l, ...partial } : l
    );
    this.updateState({ leagues });
  }

  deleteLeague(id: string) {
    const s = this.state();
    const leagues = s.leagues.filter(l => l.id !== id);
    const activeLeagueId = s.activeLeagueId === id 
      ? (leagues.length > 0 ? leagues[0].id : null) 
      : s.activeLeagueId;
      
    this.updateState({ leagues, activeLeagueId });
  }

  reset() {
    this.state.set(this.getInitialState());
  }
}
