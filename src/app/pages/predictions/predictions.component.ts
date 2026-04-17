import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';
import { ToastService } from '../../services/toast.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [FormsModule, MatIconModule, NgClass, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header [title]="roundName || 'Kolejka'" [subtitle]="competitionName"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
          <p>Nie masz aktywnej ligi.</p>
          <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">Przejdź do kokpitu</button>
        </div>
      } @else if (loading) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
          <p>Ładowanie kolejki...</p>
        </div>
      } @else if (error) {
        <div class="text-center py-10">
          <mat-icon class="text-4xl mb-2 text-red-400 opacity-50">error</mat-icon>
          <p class="text-red-400 text-sm">{{ error }}</p>
          <button (click)="reload()" class="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">Spróbuj ponownie</button>
        </div>
      } @else if (isFinished && !round) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">done_all</mat-icon>
          <p>Rozgrywki zakończone.</p>
        </div>
      } @else if (!round) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">event_busy</mat-icon>
          <p>Brak dostępnych kolejek.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (match of round.matches; track match.id) {
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm">
              @if (match.deadline && !match.isPlayed) {
                <div class="flex items-center justify-center gap-1.5 mb-3">
                  <mat-icon class="text-[14px] w-3.5 h-3.5" [ngClass]="{'text-red-400': match.deadlinePassed, 'text-zinc-400': !match.deadlinePassed}">schedule</mat-icon>
                  <span class="text-[10px] font-medium" [ngClass]="{'text-red-400': match.deadlinePassed, 'text-zinc-400': !match.deadlinePassed}">
                    {{ match.deadlinePassed ? 'Typowanie zamknięte' : formatDeadline(match.deadline) }}
                  </span>
                </div>
              }

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
                      <input type="number" min="0" [(ngModel)]="predictions[match.id].home"
                             [disabled]="round.isCompleted || match.deadlinePassed"
                             (ngModelChange)="dirty = true" placeholder="-"
                             class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 placeholder:text-zinc-600">
                      <span class="text-zinc-500">:</span>
                      <input type="number" min="0" [(ngModel)]="predictions[match.id].away"
                             [disabled]="round.isCompleted || match.deadlinePassed"
                             (ngModelChange)="dirty = true" placeholder="-"
                             class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 placeholder:text-zinc-600">
                    </div>
                  }
                </div>

                @if (round.isCompleted || match.isPlayed) {
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

              @if ((round.isCompleted || match.isPlayed) && match.prediction) {
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
            @if (hasOpenMatches) {
              <button (click)="savePredictions()" [disabled]="saving"
                      class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mb-3 text-sm active:scale-95">
                @if (saving) {
                  <mat-icon class="animate-spin text-[18px] w-[18px] h-[18px]">refresh</mat-icon>
                } @else {
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">save</mat-icon>
                }
                Zapisz typy
              </button>
            }

            @if (saved) {
              <div class="mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-emerald-400 text-xs text-center">
                Typy zapisane!
              </div>
            }

            @if (!allPredicted && hasOpenMatches) {
              <div class="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                <mat-icon class="text-amber-400 text-[20px] mt-0.5">warning</mat-icon>
                <p class="text-xs text-amber-200/80 leading-relaxed">
                  Masz nieobstawione mecze. Za puste typy otrzymasz <strong class="text-amber-400">0 punktów</strong>.
                </p>
              </div>
            }

            @if (!hasOpenMatches) {
              <div class="text-center text-zinc-500 text-xs mt-2">Czekaj na wyniki meczy. Typowanie zamknięte.</div>
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
export class PredictionsComponent implements OnInit, OnDestroy {
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  router = inject(Router);

  round: any = null;
  isFinished = false;
  roundName = '';
  competitionName = '';
  predictions: Record<number, { home: number | null; away: number | null }> = {};
  roundPoints = 0;
  loading = false;
  saving = false;
  saved = false;
  dirty = false;
  error = '';

  private lastLeagueId: number | null = null;

  private sub = toObservable(this.leagueState.activeLeagueId).subscribe((id) => {
    if (id && id !== this.lastLeagueId) {
      this.lastLeagueId = id;
      this.loadRound(id);
    } else if (!id) {
      this.round = null;
      this.loading = false;
      this.cdr.markForCheck();
    }
  });

  ngOnInit() {}

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  reload() {
    const league = this.leagueState.activeLeague();
    if (league) this.loadRound(league.id);
  }

  async loadRound(leagueId: number) {
    this.loading = true;
    this.error = '';
    this.round = null;
    this.cdr.markForCheck();

    try {
      const data = await this.api.getCurrentRound(leagueId);
      this.round = data.round;
      this.isFinished = data.isFinished;
      this.competitionName = data.competitionName || '';

      if (this.round) {
        this.roundName = this.round.name || `Kolejka ${this.round.number}`;
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
    } catch (e: any) {
      this.error = e?.error?.error || 'Nie udało się załadować kolejki';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  get hasOpenMatches() {
    if (!this.round) return false;
    return this.round.matches.some((m: any) => !m.deadlinePassed && !m.isPlayed);
  }

  get allPredicted() {
    if (!this.round) return false;
    return this.round.matches
      .filter((m: any) => !m.deadlinePassed)
      .every((m: any) =>
        this.predictions[m.id]?.home !== null &&
        this.predictions[m.id]?.home !== undefined &&
        this.predictions[m.id]?.away !== null &&
        this.predictions[m.id]?.away !== undefined
      );
  }

  formatDeadline(deadline: string): string {
    const d = new Date(deadline);
    const cutoff = new Date(d.getTime() - 15 * 60 * 1000);
    const day = cutoff.getDate().toString().padStart(2, '0');
    const month = (cutoff.getMonth() + 1).toString().padStart(2, '0');
    const hours = cutoff.getHours().toString().padStart(2, '0');
    const minutes = cutoff.getMinutes().toString().padStart(2, '0');
    return `Typuj do ${day}.${month} ${hours}:${minutes}`;
  }

  async savePredictions() {
    const league = this.leagueState.activeLeague();
    if (!league || !this.round) return;
    this.saving = true;
    this.saved = false;
    this.cdr.markForCheck();
    try {
      const preds = this.round.matches
        .filter((m: any) => !m.deadlinePassed)
        .map((m: any) => ({
          matchId: m.id,
          homeScore: this.predictions[m.id]?.home ?? null,
          awayScore: this.predictions[m.id]?.away ?? null,
        }));
      await this.api.savePredictions(league.id, this.round.id, preds);
      this.dirty = false;
      this.saved = true;
      this.toast.success('Typy zapisane!');
      setTimeout(() => { this.saved = false; this.cdr.markForCheck(); }, 3000);
    } catch {
      // error toast shown by interceptor
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  async nextRound() {
    const league = this.leagueState.activeLeague();
    if (!league) return;
    try {
      await this.api.nextRound(league.id);
      await this.leagueState.loadLeagues();
      await this.loadRound(league.id);
      this.toast.success('Przejście do następnej kolejki');
      window.scrollTo(0, 0);
    } catch {
      // error toast shown by interceptor
    }
  }
}
