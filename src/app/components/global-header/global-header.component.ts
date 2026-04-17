import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeagueStateService } from '../../services/league-state.service';

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [MatIconModule, NgClass, RouterLink],
  template: `
    <header class="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <mat-icon class="text-blue-400 text-[18px] w-[18px] h-[18px]">sports_soccer</mat-icon>
        </div>
        <div>
          <h1 class="text-white font-bold text-sm leading-tight">Typer 2026</h1>
          @if (auth.isAdmin()) {
            <p class="text-red-400 text-[10px] uppercase tracking-wider font-medium">Panel Admina</p>
          } @else {
            <p class="text-zinc-400 text-[10px] uppercase tracking-wider font-medium">Mistrzostwa</p>
          }
        </div>
      </div>

      <div class="flex items-center gap-2">
        @if (!auth.isAdmin()) {
          <div class="relative">
            <button (click)="dropdownOpen = !dropdownOpen"
                    class="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all">
              <div class="text-right">
                <div class="text-[10px] text-zinc-400 uppercase tracking-wider font-medium leading-none mb-0.5">Aktywna Liga</div>
                <div class="text-white text-xs font-semibold leading-none max-w-[100px] truncate">
                  {{ leagueState.activeLeague()?.name || 'Wybierz ligę' }}
                </div>
              </div>
              <mat-icon class="text-zinc-400 text-[18px] w-[18px] h-[18px]" [ngClass]="{'rotate-180': dropdownOpen}">expand_more</mat-icon>
            </button>

            @if (dropdownOpen) {
              <div class="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div class="p-2">
                  @if (leagueState.myLeagues().length > 0) {
                    <div class="text-[10px] text-zinc-500 uppercase tracking-wider font-bold px-2 py-1">Moje Ligi</div>
                    @for (league of leagueState.myLeagues(); track league.id) {
                      <button (click)="selectLeague(league.id)"
                              class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors"
                              [ngClass]="{'bg-blue-500/10 text-blue-400': leagueState.activeLeagueId() === league.id, 'text-zinc-300 hover:bg-white/5': leagueState.activeLeagueId() !== league.id}">
                        <span class="text-sm font-medium truncate">{{ league.name }}</span>
                        @if (leagueState.activeLeagueId() === league.id) {
                          <mat-icon class="text-[16px] w-[16px] h-[16px]">check</mat-icon>
                        }
                      </button>
                    }
                  }

                  @if (leagueState.joinedLeagues().length > 0) {
                    <div class="text-[10px] text-zinc-500 uppercase tracking-wider font-bold px-2 py-1 mt-2">Dołączyłem</div>
                    @for (league of leagueState.joinedLeagues(); track league.id) {
                      <button (click)="selectLeague(league.id)"
                              class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors"
                              [ngClass]="{'bg-blue-500/10 text-blue-400': leagueState.activeLeagueId() === league.id, 'text-zinc-300 hover:bg-white/5': leagueState.activeLeagueId() !== league.id}">
                        <span class="text-sm font-medium truncate">{{ league.name }}</span>
                        @if (leagueState.activeLeagueId() === league.id) {
                          <mat-icon class="text-[16px] w-[16px] h-[16px]">check</mat-icon>
                        }
                      </button>
                    }
                  }

                  @if (leagueState.leagues().length === 0) {
                    <div class="px-3 py-4 text-zinc-500 text-xs text-center">Brak lig</div>
                  }
                </div>
              </div>
              <div class="fixed inset-0 z-40" (click)="dropdownOpen = false"></div>
            }
          </div>
        }

        <a routerLink="/profile" class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
          <mat-icon class="text-[16px] w-4 h-4">person</mat-icon>
        </a>
      </div>
    </header>
  `
})
export class GlobalHeaderComponent implements OnInit {
  auth = inject(AuthService);
  leagueState = inject(LeagueStateService);
  dropdownOpen = false;

  async ngOnInit() {
    if (!this.auth.isAdmin()) {
      await this.leagueState.loadLeagues();
    }
  }

  selectLeague(id: number) {
    this.leagueState.setActiveLeague(id);
    this.dropdownOpen = false;
  }
}
