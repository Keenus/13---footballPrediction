import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface CompetitionSummary {
  id: number;
  name: string;
  type: string;
  season: string | null;
  isFinished: boolean;
  currentRoundIndex: number;
}

export interface LeagueSummary {
  id: number;
  name: string;
  ownerId: number;
  ownerName: string;
  inviteCode: string;
  isFinished: boolean;
  memberCount: number;
  competitions: CompetitionSummary[];
  myRole: string;
  myPoints: number;
  isOwner: boolean;
}

@Injectable({ providedIn: 'root' })
export class LeagueStateService {
  private api = inject(ApiService);

  leagues = signal<LeagueSummary[]>([]);
  activeLeagueId = signal<number | null>(null);
  loading = signal(false);

  activeLeague = computed(() => {
    const id = this.activeLeagueId();
    return this.leagues().find(l => l.id === id) || null;
  });

  myLeagues = computed(() => this.leagues().filter(l => l.isOwner));
  joinedLeagues = computed(() => this.leagues().filter(l => !l.isOwner));

  async loadLeagues(): Promise<void> {
    this.loading.set(true);
    try {
      const leagues = await this.api.getLeagues();
      this.leagues.set(leagues);
      if (leagues.length > 0 && !this.activeLeagueId()) {
        this.activeLeagueId.set(leagues[0].id);
      }
      if (this.activeLeagueId() && !leagues.find(l => l.id === this.activeLeagueId())) {
        this.activeLeagueId.set(leagues.length > 0 ? leagues[0].id : null);
      }
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      this.loading.set(false);
    }
  }

  setActiveLeague(id: number) {
    this.activeLeagueId.set(id);
  }
}
