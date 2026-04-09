import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';
import { effect } from '@angular/core';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [FormsModule, MatIconModule, NgClass, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header [title]="'Kolejka ' + roundNumber" subtitle="Wpisz swoje typy i wylosuj wyniki"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
          <p>Nie masz aktywnej ligi.</p>
          <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">Przejdź do kokpitu</button>
        </div>
      } @else if (isFinished) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">done_all</mat-icon>
          <p>Liga zakończona.</p>
        </div>
      } @else if (!round) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">hourglass_empty</mat-icon>
          <p>Ładowanie...</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (match of round.matches; track match.id) {
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <div class="flex-1 text-right pr-3">
                  <div class="font-semibold text-white text-sm">{{ match.homeTeam.name }}</div>
                </div>
                <div class="px-2 text-zinc-500 text-xs font-bold">VS</div>
                <div class="flex-1 text-left pl-3">
                  <div class="font-semibold text-white text-sm">{{ match.awayTeam.name }}</div>
                </div>
              </div>

              <div class="flex justify-center items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                <div class="flex flex-col items-center">
                  <div class="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider">Twój typ</div>
                  @if (round.isCompleted && predictions[match.id]?.home === null) {
                    <div class="h-12 flex items-center justify-center text-zinc-500 text-xs font-medium bg-white/5 border border-white/10 rounded-xl px-4">
                      Brak typu (0 pkt)
                    </div>
                  } @else {
                    <div class="flex items-center gap-2">
                      <input type="number" min="0" [(ngModel)]="predictions[match.id].home" [disabled]="round.isCompleted"
                             (ngModelChange)="onPredictionChange()" placeholder="-"
                             class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 placeholder:text-zinc-600">
                      <span class="text-zinc-500">:</span>
                      <input type="number" min="0" [(ngModel)]="predictions[match.id].away" [disabled]="round.isCompleted"
                             (ngModelChange)="onPredictionChange()" placeholder="-"
                             class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 placeholder:text-zinc-600">
                    </div>
                  }
                </div>

                @if (round.isCompleted) {
                  <div class="w-px h-12 bg-white/10"></div>
                  <div class="flex flex-col items-center">
                    <div class="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider">Wynik</div>
                    <div class="flex items-center gap-2">
                      <div class="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold rounded-lg text-lg">{{ match.homeScore }}</div>
                      <span class="text-zinc-500">:</span>
                      <div class="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold rounded-lg text-lg">{{ match.awayScore }}</div>
                    </div>
                  </div>
                }
              </div>

              @if (round.isCompleted && match.prediction) {
                <div class="mt-3 flex justify-center">
                  <div class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                       [ngClass]="{
                         'bg-emerald-500/20 text-emerald-400': match.prediction.pointsEarned === 3,
                         'bg-blue-500/20 text-blue-400': match.prediction.pointsEarned === 2,
                         'bg-amber-500/20 text-amber-400': match.prediction.pointsEarned === 1,
                         'bg-zinc-800 text-zinc-400': match.prediction.pointsEarned === 0
                       }">
                    <mat-icon class="text-[14px] w-[14px] h-[14px]">stars</mat-icon>
                    +{{ match.prediction.pointsEarned }} pkt
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="mt-8">
          @if (!round.isCompleted) {
            <button (click)="savePredictions()" [disabled]="saving"
                    class="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mb-3 text-sm">
              <mat-icon class="text-[18px] w-[18px] h-[18px]">save</mat-icon> Zapisz typy
            </button>

            @if (leagueState.activeLeague()?.isOwner) {
              <button (click)="simulateRound()" [disabled]="simulating"
                      class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95">
                <mat-icon class="text-[20px] w-5 h-5">casino</mat-icon> Wylosuj Wyniki
              </button>
            } @else {
              <div class="text-center text-zinc-500 text-xs mt-2">Tylko właściciel ligi może wylosować wyniki.</div>
            }

            @if (!allPredicted) {
              <div class="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                <mat-icon class="text-amber-400 text-[20px] mt-0.5">warning</mat-icon>
                <p class="text-xs text-amber-200/80 leading-relaxed">
                  Masz nieobstawione mecze. Za puste typy otrzymasz <strong class="text-amber-400">0 punktów</strong>.
                </p>
              </div>
            }
          } @else {
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center mb-4">
              <h3 class="text-blue-400 text-sm font-medium mb-1">Zdobyte punkty w kolejce</h3>
              <div class="text-4xl font-bold text-white">{{ roundPoints }}</div>
            </div>

            @if (leagueState.activeLeague()?.isOwner) {
              <button (click)="nextRound()"
                      class="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95">
                Następna Kolejka <mat-icon class="text-[20px] w-5 h-5">arrow_forward</mat-icon>
              </button>
            } @else {
              <div class="text-center text-zinc-500 text-xs">Czekaj aż właściciel przejdzie do następnej kolejki.</div>
            }
          }
        </div>
      }
    </div>
  `
})
export class PredictionsComponent implements OnInit {
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  router = inject(Router);

  round: any = null;
  isFinished = false;
  roundNumber: string | number = '-';
  predictions: Record<number, { home: number | null; away: number | null }> = {};
  roundPoints = 0;
  saving = false;
  simulating = false;
  dirty = false;

  private leagueEffect = effect(() => {
    const league = this.leagueState.activeLeague();
    if (league) {
      this.loadRound(league.id);
    }
  });

  async ngOnInit() {
    const league = this.leagueState.activeLeague();
    if (league) {
      await this.loadRound(league.id);
    }
  }

  async loadRound(leagueId: number) {
    try {
      const data = await this.api.getCurrentRound(leagueId);
      this.round = data.round;
      this.isFinished = data.isFinished;

      if (this.round) {
        this.roundNumber = this.round.number;
        this.predictions = {};
        for (const match of this.round.matches) {
          this.predictions[match.id] = {
            home: match.prediction?.homeScore ?? null,
            away: match.prediction?.awayScore ?? null,
          };
        }
        if (this.round.isCompleted) {
          this.roundPoints = this.round.matches.reduce(
            (sum: number, m: any) => sum + (m.prediction?.pointsEarned || 0), 0
          );
        }
      }
    } catch {}
  }

  get allPredicted() {
    if (!this.round) return false;
    return this.round.matches.every((m: any) =>
      this.predictions[m.id]?.home !== null &&
      this.predictions[m.id]?.home !== undefined &&
      this.predictions[m.id]?.away !== null &&
      this.predictions[m.id]?.away !== undefined
    );
  }

  onPredictionChange() {
    this.dirty = true;
  }

  async savePredictions() {
    const league = this.leagueState.activeLeague();
    if (!league || !this.round) return;
    this.saving = true;
    try {
      const preds = this.round.matches.map((m: any) => ({
        matchId: m.id,
        homeScore: this.predictions[m.id]?.home ?? null,
        awayScore: this.predictions[m.id]?.away ?? null,
      }));
      await this.api.savePredictions(league.id, this.round.id, preds);
      this.dirty = false;
    } catch {}
    this.saving = false;
  }

  async simulateRound() {
    const league = this.leagueState.activeLeague();
    if (!league) return;
    this.simulating = true;
    try {
      if (this.dirty) await this.savePredictions();
      const result = await this.api.simulateRound(league.id);
      this.roundPoints = result.roundPoints;
      await this.loadRound(league.id);
      await this.leagueState.loadLeagues();
    } catch {}
    this.simulating = false;
  }

  async nextRound() {
    const league = this.leagueState.activeLeague();
    if (!league) return;
    try {
      await this.api.nextRound(league.id);
      await this.leagueState.loadLeagues();
      await this.loadRound(league.id);
      window.scrollTo(0, 0);
    } catch {}
  }
}
