import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [MatIconModule, NgClass, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Historia" subtitle="Rozegrane kolejki"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl text-center text-white/50 py-10 px-4">
          <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">sports_soccer</mat-icon>
          <div class="relative z-[1]">
            <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
            <p class="font-black uppercase tracking-tight">Nie masz aktywnej ligi.</p>
            <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-3 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] rounded-xl font-black uppercase tracking-wider text-sm">Przejdź do kokpitu</button>
          </div>
        </div>
      } @else if (loading) {
        <div class="text-center text-white/50 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
          <p>Ładowanie historii...</p>
        </div>
      } @else if (error) {
        <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl text-center py-10 px-4">
          <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">error</mat-icon>
          <div class="relative z-[1]">
            <mat-icon class="text-4xl mb-2 text-red-400 opacity-50">error</mat-icon>
            <p class="text-red-400 text-sm">{{ error }}</p>
            <button (click)="retry()" class="mt-4 px-4 py-3 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] rounded-xl font-black uppercase tracking-wider text-sm">Spróbuj ponownie</button>
          </div>
        </div>
      } @else if (history.length === 0) {
        <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl text-center text-white/50 py-10 px-4">
          <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">history</mat-icon>
          <div class="relative z-[1]">
            <mat-icon class="text-4xl mb-2 opacity-50">history</mat-icon>
            <p class="font-black uppercase tracking-tight">Brak rozegranych kolejek.</p>
          </div>
        </div>
      } @else {
        <div class="space-y-6">
          @for (round of history; track round.id) {
            <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl">
              <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">scoreboard</mat-icon>
              <div class="relative z-[1]">
                <div class="px-5 py-3 border-b border-white/[0.06] flex justify-between items-center">
                  <h3 class="font-black text-white uppercase tracking-tight">Kolejka {{ round.number }}</h3>
                  <div class="text-xs font-bold bg-[#FEF400]/[0.08] text-[#FEF400]/70 px-2 py-1 rounded-lg">
                    +{{ round.roundPoints }} pkt
                  </div>
                </div>

                <div class="p-2 space-y-2">
                  @for (match of round.matches; track match.id) {
                    <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                      <div class="flex-1 text-right text-sm font-black text-zinc-300 pr-2 truncate">{{ match.homeTeam.name }}</div>

                      <div class="flex flex-col items-center px-2">
                        <div class="text-[10px] text-white/35 mb-1">
                          Typ:
                          @if (!match.prediction || match.prediction.homeScore === null) {
                            <span class="text-amber-500/80">Brak</span>
                          } @else {
                            {{ match.prediction.homeScore }}:{{ match.prediction.awayScore }}
                          }
                        </div>
                        <div class="font-bold text-white bg-black/15 px-3 py-1 rounded-lg border border-white/[0.06]">{{ match.homeScore }}:{{ match.awayScore }}</div>
                      </div>

                      <div class="flex-1 text-left text-sm font-black text-zinc-300 pl-2 truncate">{{ match.awayTeam.name }}</div>

                      <div class="ml-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                           [ngClass]="{
                             'bg-emerald-500/20 text-emerald-400': (match.prediction?.pointsEarned || 0) === 3,
                             'bg-[#FEF400]/[0.08] text-[#FEF400]/70': (match.prediction?.pointsEarned || 0) === 2,
                             'bg-amber-500/20 text-amber-400': (match.prediction?.pointsEarned || 0) === 1,
                             'bg-white/[0.06] text-white/35': (match.prediction?.pointsEarned || 0) === 0
                           }">
                        {{ match.prediction?.pointsEarned || 0 }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class HistoryComponent implements OnInit, OnDestroy {
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  history: any[] = [];
  loading = false;
  error = '';

  private sub = toObservable(this.leagueState.activeLeagueId).subscribe((id) => {
    if (id) this.loadHistory(id);
  });

  ngOnInit() {}

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  retry() {
    const id = this.leagueState.activeLeagueId();
    if (id) this.loadHistory(id);
  }

  async loadHistory(leagueId: number) {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    try {
      this.history = await this.api.getHistory(leagueId);
    } catch {
      this.history = [];
      this.error = 'Nie udało się załadować historii';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
