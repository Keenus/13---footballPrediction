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
      <app-page-header title="Ranking graczy" subtitle="Porównaj swoje punkty z innymi"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl text-center text-white/35 py-10 px-4">
          <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">sports_soccer</mat-icon>
          <div class="relative z-[1]">
            <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
            <p class="font-black uppercase tracking-tight">Nie masz aktywnej ligi.</p>
            <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-3 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] rounded-xl font-black uppercase tracking-wider text-sm">Przejdź do kokpitu</button>
          </div>
        </div>
      } @else if (loading) {
        <div class="text-center text-white/35 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
          <p>Ładowanie rankingu...</p>
        </div>
      } @else {
        @if (isLimited) {
          <div class="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-3">
            <mat-icon class="text-amber-400 text-[20px]">lock</mat-icon>
            <div>
              <p class="text-xs text-amber-200/80 leading-relaxed">Widzisz tylko top 3 i swoją pozycję. <a routerLink="/subscription" class="text-[#FEF400]/70 font-semibold underline">Ulepsz plan</a> aby zobaczyć pełny ranking.</p>
            </div>
          </div>
        }

        <div class="space-y-3">
          @for (tipster of ranking; track tipster.user_id) {
            <div class="relative overflow-hidden rounded-2xl border p-4 flex items-center gap-4"
                 [ngClass]="{
                   'bg-[#FEF400]/[0.06] border-[#FEF400]/15': tipster.position === 1,
                   'bg-zinc-500/[0.06] border-zinc-400/15': tipster.position === 2,
                   'bg-amber-800/[0.06] border-amber-700/15': tipster.position === 3,
                   'bg-[#262220] border-white/[0.06]': tipster.position > 3 && !tipster.isUser,
                   'bg-[#262220] border-[#FEF400]/15': tipster.isUser && tipster.position > 3
                 }">

              @if (tipster.position <= 3) {
                <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">military_tech</mat-icon>
              }

              <div class="relative z-[1] flex items-center gap-4 w-full">
                <div class="w-8 text-center font-black"
                     [ngClass]="{
                       'text-2xl text-[#FEF400] drop-shadow-[0_0_8px_rgba(254,244,0,0.3)]': tipster.position === 1,
                       'text-2xl text-zinc-300 drop-shadow-[0_0_6px_rgba(161,161,170,0.4)]': tipster.position === 2,
                       'text-2xl text-amber-700 drop-shadow-[0_0_6px_rgba(180,83,9,0.4)]': tipster.position === 3,
                       'text-xl text-white/35': tipster.position > 3
                     }">
                  {{ tipster.position }}
                </div>

                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                     [ngClass]="{'bg-[#FEF400] !text-[#1E1A17]': tipster.isUser, 'bg-white/[0.08]': !tipster.isUser}">
                  <mat-icon>{{ tipster.avatar }}</mat-icon>
                </div>

                <div class="flex-1">
                  <div class="font-black text-white text-base flex items-center gap-2">
                    {{ tipster.username }}
                    @if (tipster.isUser) {
                      <span class="px-2 py-0.5 rounded-xl bg-[#FEF400]/[0.08] text-[#FEF400]/70 text-[10px] uppercase tracking-wider font-bold">Ty</span>
                    }
                  </div>
                  <div class="text-white/35 text-xs mt-0.5">
                    {{ tipster.role === 'owner' ? 'Właściciel ligi' : 'Uczestnik' }}
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-2xl font-black text-white tracking-tight">{{ tipster.totalPoints }}</div>
                  <div class="text-[10px] text-white/25 uppercase tracking-widest font-bold">pkt</div>
                </div>
              </div>
            </div>
          }

          @if (ranking.length === 0) {
            <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl text-center text-white/35 py-6 px-4">
              <mat-icon class="absolute right-[-8px] bottom-[-8px] text-[60px] w-[60px] h-[60px] opacity-[0.04] pointer-events-none text-white">leaderboard</mat-icon>
              <p class="relative z-[1] font-black uppercase tracking-tight text-sm">Brak danych rankingowych.</p>
            </div>
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
