import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [MatIconModule, NgClass, PageHeaderComponent, RouterLink],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Ranking Typerów" subtitle="Porównaj swoje punkty z innymi"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
          <p>Nie masz aktywnej ligi.</p>
          <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">Przejdź do kokpitu</button>
        </div>
      } @else if (loading) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
          <p>Ładowanie rankingu...</p>
        </div>
      } @else {
        @if (isLimited) {
          <div class="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
            <mat-icon class="text-amber-400 text-[20px]">lock</mat-icon>
            <div>
              <p class="text-xs text-amber-200/80 leading-relaxed">Widzisz tylko top 3 i swoją pozycję. <a routerLink="/subscription" class="text-amber-400 font-semibold underline">Ulepsz plan</a> aby zobaczyć pełny ranking.</p>
            </div>
          </div>
        }

        <div class="space-y-3">
          @for (tipster of ranking; track tipster.user_id) {
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm overflow-hidden flex items-center gap-4"
                 [ngClass]="{'border-blue-500/30 bg-blue-900/10': tipster.isUser}">

              @if (tipster.position === 1) {
                <div class="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-4 -mt-4"></div>
              } @else if (tipster.position === 2) {
                <div class="absolute top-0 right-0 w-16 h-16 bg-zinc-400/10 rounded-full blur-xl -mr-4 -mt-4"></div>
              } @else if (tipster.position === 3) {
                <div class="absolute top-0 right-0 w-16 h-16 bg-amber-700/10 rounded-full blur-xl -mr-4 -mt-4"></div>
              }

              <div class="w-8 text-center font-bold text-xl"
                   [ngClass]="{
                     'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]': tipster.position === 1,
                     'text-zinc-300': tipster.position === 2,
                     'text-amber-700': tipster.position === 3,
                     'text-zinc-500': tipster.position > 3
                   }">
                {{ tipster.position }}
              </div>

              <div class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-inner"
                   [ngClass]="{'bg-gradient-to-br from-blue-400 to-indigo-600': tipster.isUser, 'bg-gradient-to-br from-zinc-600 to-zinc-800': !tipster.isUser}">
                <mat-icon>{{ tipster.avatar }}</mat-icon>
              </div>

              <div class="flex-1">
                <div class="font-semibold text-white text-base flex items-center gap-2">
                  {{ tipster.username }}
                  @if (tipster.isUser) {
                    <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] uppercase tracking-wider font-bold">Ty</span>
                  }
                </div>
                <div class="text-zinc-400 text-xs mt-0.5">
                  {{ tipster.role === 'owner' ? 'Właściciel ligi' : 'Uczestnik' }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-2xl font-bold text-white tracking-tight">{{ tipster.totalPoints }}</div>
                <div class="text-[10px] text-zinc-500 uppercase font-medium">pkt</div>
              </div>
            </div>
          }

          @if (ranking.length === 0) {
            <div class="text-center text-zinc-500 py-6 text-sm">Brak danych rankingowych.</div>
          }
        </div>
      }
    </div>
  `
})
export class RankingComponent implements OnInit, OnDestroy {
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  ranking: any[] = [];
  isLimited = false;
  loading = false;

  private sub = toObservable(this.leagueState.activeLeagueId).subscribe((id) => {
    if (id) this.loadRanking(id);
  });

  ngOnInit() {}

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async loadRanking(leagueId: number) {
    this.loading = true;
    this.cdr.markForCheck();
    try {
      const data = await this.api.getRanking(leagueId);
      this.ranking = data.ranking;
      this.isLimited = data.isLimited;
    } catch {
      this.ranking = [];
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
