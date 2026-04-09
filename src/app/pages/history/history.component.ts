import { Component, inject, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [MatIconModule, NgClass, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Historia" subtitle="Rozegrane kolejki"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
          <p>Nie masz aktywnej ligi.</p>
          <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">Przejdź do kokpitu</button>
        </div>
      } @else if (history.length === 0) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">history</mat-icon>
          <p>Brak rozegranych kolejek.</p>
        </div>
      } @else {
        <div class="space-y-6">
          @for (round of history; track round.id) {
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div class="bg-black/20 px-5 py-3 border-b border-white/5 flex justify-between items-center">
                <h3 class="font-semibold text-white">Kolejka {{ round.number }}</h3>
                <div class="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">
                  +{{ round.roundPoints }} pkt
                </div>
              </div>

              <div class="p-2 space-y-2">
                @for (match of round.matches; track match.id) {
                  <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div class="flex-1 text-right text-sm font-medium text-zinc-300 pr-2 truncate">{{ match.homeTeam.name }}</div>

                    <div class="flex flex-col items-center px-2">
                      <div class="text-[10px] text-zinc-500 mb-1">
                        Typ:
                        @if (!match.prediction || match.prediction.homeScore === null) {
                          <span class="text-amber-500/80">Brak</span>
                        } @else {
                          {{ match.prediction.homeScore }}:{{ match.prediction.awayScore }}
                        }
                      </div>
                      <div class="font-bold text-white bg-black/30 px-3 py-1 rounded-lg border border-white/5">{{ match.homeScore }}:{{ match.awayScore }}</div>
                    </div>

                    <div class="flex-1 text-left text-sm font-medium text-zinc-300 pl-2 truncate">{{ match.awayTeam.name }}</div>

                    <div class="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                         [ngClass]="{
                           'bg-emerald-500/20 text-emerald-400': (match.prediction?.pointsEarned || 0) === 3,
                           'bg-blue-500/20 text-blue-400': (match.prediction?.pointsEarned || 0) === 2,
                           'bg-amber-500/20 text-amber-400': (match.prediction?.pointsEarned || 0) === 1,
                           'bg-zinc-800 text-zinc-400': (match.prediction?.pointsEarned || 0) === 0
                         }">
                      {{ match.prediction?.pointsEarned || 0 }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class HistoryComponent implements OnInit {
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  router = inject(Router);

  history: any[] = [];

  private leagueEffect = effect(() => {
    const league = this.leagueState.activeLeague();
    if (league) {
      this.loadHistory(league.id);
    }
  });

  async ngOnInit() {
    const league = this.leagueState.activeLeague();
    if (league) await this.loadHistory(league.id);
  }

  async loadHistory(leagueId: number) {
    try {
      this.history = await this.api.getHistory(leagueId);
    } catch {}
  }
}
