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
    <header class="sticky top-0 z-40 bg-[#1E1A17]/80 backdrop-blur-2xl border-b border-white/[0.06] px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#FEF400] flex items-center justify-center shadow-lg shadow-[#FEF400]/10">
          <mat-icon class="text-[#1E1A17] text-[20px] w-5 h-5">sports_soccer</mat-icon>
        </div>
        <div>
          <h1 class="text-white font-black text-[15px] leading-tight tracking-wide uppercase">Typ<span class="text-[#FEF400]">Liga</span></h1>
          @if (auth.isAdmin()) {
            <p class="text-red-400/80 text-[10px] uppercase tracking-widest font-semibold">Panel Admina</p>
          } @else {
            <p class="text-white/30 text-[10px] uppercase tracking-widest font-medium">Typuj i wygrywaj</p>
          }
        </div>
      </div>

      <div class="flex items-center gap-2">
        @if (!auth.isAdmin()) {
          <div class="relative">
            <button (click)="dropdownOpen = !dropdownOpen"
                    class="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl px-3 py-2 transition-all">
              <div class="text-right">
                <div class="text-[8px] text-white/30 uppercase tracking-[0.15em] font-bold leading-none mb-0.5">TypLiga</div>
                <div class="text-white/90 text-xs font-semibold leading-none max-w-[100px] truncate">
                  {{ leagueState.activeLeague()?.name || 'Wybierz' }}
                </div>
              </div>
              <mat-icon class="text-white/30 text-[18px] w-[18px] h-[18px] transition-transform" [ngClass]="{'rotate-180': dropdownOpen}">expand_more</mat-icon>
            </button>

            @if (dropdownOpen) {
              <div class="absolute top-full right-0 mt-2 w-64 bg-[#2a2520] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                <div class="p-2">
                  @if (leagueState.myLeagues().length > 0) {
                    <div class="text-[10px] text-white/30 uppercase tracking-widest font-bold px-3 py-1.5">Moje typligi</div>
                    @for (league of leagueState.myLeagues(); track league.id) {
                      <button (click)="selectLeague(league.id)"
                              class="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors"
                              [ngClass]="{'bg-[#FEF400]/[0.08] text-[#FEF400]': leagueState.activeLeagueId() === league.id, 'text-white/70 hover:bg-white/[0.06]': leagueState.activeLeagueId() !== league.id}">
                        <span class="text-sm font-medium truncate">{{ league.name }}</span>
                        @if (leagueState.activeLeagueId() === league.id) {
                          <mat-icon class="text-[16px] w-[16px] h-[16px]">check</mat-icon>
                        }
                      </button>
                    }
                  }

                  @if (leagueState.joinedLeagues().length > 0) {
                    <div class="text-[10px] text-white/30 uppercase tracking-widest font-bold px-3 py-1.5 mt-1">Dołączyłem</div>
                    @for (league of leagueState.joinedLeagues(); track league.id) {
                      <button (click)="selectLeague(league.id)"
                              class="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors"
                              [ngClass]="{'bg-[#FEF400]/[0.08] text-[#FEF400]': leagueState.activeLeagueId() === league.id, 'text-white/70 hover:bg-white/[0.06]': leagueState.activeLeagueId() !== league.id}">
                        <span class="text-sm font-medium truncate">{{ league.name }}</span>
                        @if (leagueState.activeLeagueId() === league.id) {
                          <mat-icon class="text-[16px] w-[16px] h-[16px]">check</mat-icon>
                        }
                      </button>
                    }
                  }

                  @if (leagueState.leagues().length === 0) {
                    <div class="px-3 py-4 text-white/30 text-xs text-center">Brak typlig</div>
                  }
                </div>
              </div>
              <div class="fixed inset-0 z-40" (click)="dropdownOpen = false"></div>
            }
          </div>
        }

        <a routerLink="/profile" class="w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center text-white/60 transition-colors">
          <mat-icon class="text-[18px] w-[18px] h-[18px]">person</mat-icon>
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
