import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { LeagueStateService, LeagueSummary } from '../../services/league-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, NgClass, FormsModule, RouterLink],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24 space-y-6 pt-6">

      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center shadow-sm">
          <mat-icon class="text-blue-400 text-[20px] w-5 h-5 mb-1 mx-auto">stars</mat-icon>
          <div class="text-xl font-bold text-white leading-none">{{ stats?.totalPoints || 0 }}</div>
          <div class="text-[9px] text-zinc-400 uppercase tracking-wider mt-1 font-medium">Punkty</div>
        </div>
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center shadow-sm">
          <mat-icon class="text-emerald-400 text-[20px] w-5 h-5 mb-1 mx-auto">my_location</mat-icon>
          <div class="text-xl font-bold text-white leading-none">{{ stats?.exactScores || 0 }}</div>
          <div class="text-[9px] text-zinc-400 uppercase tracking-wider mt-1 font-medium">Dokładne</div>
        </div>
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center shadow-sm">
          <mat-icon class="text-amber-400 text-[20px] w-5 h-5 mb-1 mx-auto">check_circle</mat-icon>
          <div class="text-xl font-bold text-white leading-none">{{ stats?.correctResults || 0 }}</div>
          <div class="text-[9px] text-zinc-400 uppercase tracking-wider mt-1 font-medium">Trafione</div>
        </div>
      </div>

      @if (leagueState.activeLeague(); as activeLeague) {
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div class="relative z-10 flex justify-between items-start mb-4">
            <div>
              <div class="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Aktywna Liga</div>
              <h2 class="text-2xl font-bold text-white leading-tight">{{ activeLeague.name }}</h2>
              @if (activeLeague.competitions.length > 0) {
                <div class="text-blue-200 text-[10px] mt-1">
                  {{ activeLeague.competitions.map(c => c.name).join(', ') }}
                </div>
              }
            </div>
            <div class="bg-black/20 backdrop-blur-md rounded-xl px-3 py-1.5 text-center border border-white/10">
              <div class="text-white font-bold text-lg leading-none">{{ activeLeague.myPoints }}</div>
              <div class="text-blue-200 text-[9px] uppercase tracking-wider mt-0.5">pkt</div>
            </div>
          </div>

          @if (!activeLeague.isFinished) {
            <button (click)="goToPredictions()" class="w-full py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95">
              <mat-icon class="text-[20px] w-5 h-5">play_arrow</mat-icon> Typuj
            </button>
          } @else {
            <div class="w-full py-3.5 bg-black/20 text-white font-semibold rounded-xl text-center border border-white/10">
              Liga Zakończona
            </div>
          }
        </div>
      } @else {
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center shadow-sm">
          <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
            <mat-icon class="text-blue-400">sports_soccer</mat-icon>
          </div>
          <h2 class="text-lg font-bold text-white mb-1">Brak Aktywnej Ligi</h2>
          <p class="text-zinc-400 text-xs mb-4">Wybierz ligę z listy poniżej, stwórz nową lub dołącz kodem.</p>
        </div>
      }

      <div class="space-y-6">
        <div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-zinc-100 font-semibold text-sm uppercase tracking-wider">Moje Ligi</h3>
            @if (auth.canCreateLeagues()) {
              <button (click)="openCreateLeague()" class="text-blue-400 text-xs font-semibold flex items-center bg-blue-500/10 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors">
                <mat-icon class="text-[14px] w-3.5 h-3.5 mr-1">add</mat-icon> Nowa
              </button>
            }
          </div>

          <div class="space-y-2">
            @for (league of leagueState.myLeagues(); track league.id) {
              <div class="p-3 rounded-2xl border transition-all flex justify-between items-center backdrop-blur-xl"
                   [ngClass]="{'bg-blue-900/20 border-blue-500/30': leagueState.activeLeagueId() === league.id, 'bg-white/5 border-white/10': leagueState.activeLeagueId() !== league.id}">
                <div class="flex-1 cursor-pointer" (click)="leagueState.setActiveLeague(league.id)">
                  <div class="font-semibold text-white text-sm">{{ league.name }}</div>
                  <div class="text-[10px] text-zinc-400 mt-0.5">{{ league.competitions.length }} rozgrywek | {{ league.memberCount }} graczy</div>
                </div>
                <div class="flex items-center gap-1">
                  <button (click)="showInviteCode(league)" class="p-2 text-zinc-500 hover:text-blue-400 transition-colors rounded-xl hover:bg-white/5" title="Kod zaproszenia">
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">share</mat-icon>
                  </button>
                  <button (click)="confirmDelete(league)" class="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5">
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">delete</mat-icon>
                  </button>
                </div>
              </div>
            }
            @if (leagueState.myLeagues().length === 0) {
              <div class="text-center py-4 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
                @if (auth.canCreateLeagues()) {
                  Nie stworzyłeś jeszcze żadnej ligi.
                } @else {
                  Twój plan nie pozwala na tworzenie lig. <a routerLink="/subscription" class="text-blue-400">Ulepsz plan</a>
                }
              </div>
            }
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-zinc-100 font-semibold text-sm uppercase tracking-wider">Dołączyłem</h3>
            <a routerLink="/join-league" class="text-emerald-400 text-xs font-semibold flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors">
              <mat-icon class="text-[14px] w-3.5 h-3.5 mr-1">group_add</mat-icon> Dołącz
            </a>
          </div>

          <div class="space-y-2">
            @for (league of leagueState.joinedLeagues(); track league.id) {
              <div class="p-3 rounded-2xl border transition-all flex justify-between items-center backdrop-blur-xl"
                   [ngClass]="{'bg-blue-900/20 border-blue-500/30': leagueState.activeLeagueId() === league.id, 'bg-white/5 border-white/10': leagueState.activeLeagueId() !== league.id}">
                <div class="flex-1 cursor-pointer" (click)="leagueState.setActiveLeague(league.id)">
                  <div class="font-semibold text-white text-sm">{{ league.name }}</div>
                  <div class="text-[10px] text-zinc-400 mt-0.5">{{ league.competitions.length }} rozgrywek | {{ league.memberCount }} graczy</div>
                </div>
                <button (click)="confirmLeave(league)" class="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5" title="Opuść ligę">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">exit_to_app</mat-icon>
                </button>
              </div>
            }
            @if (leagueState.joinedLeagues().length === 0) {
              <div class="text-center py-4 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
                Nie dołączyłeś do żadnej ligi.
              </div>
            }
          </div>
        </div>
      </div>

      @if (showCreateLeague) {
        <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-zinc-900/90 backdrop-blur-2xl p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-4">Nowa Liga Typerska</h3>
            <div class="mb-4">
              <label class="block text-zinc-400 text-xs font-medium mb-2">Nazwa ligi</label>
              <input type="text" [(ngModel)]="newLeagueName" placeholder="np. Liga firmowa"
                     class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            </div>
            <div class="mb-6">
              <label class="block text-zinc-400 text-xs font-medium mb-2">Wybierz rozgrywki</label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                @for (comp of availableCompetitions; track comp.id) {
                  <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                         [ngClass]="{'bg-blue-500/10 border-blue-500/30': selectedCompetitionIds.has(comp.id), 'bg-black/20 border-white/10 hover:border-white/20': !selectedCompetitionIds.has(comp.id)}">
                    <input type="checkbox" [checked]="selectedCompetitionIds.has(comp.id)" (change)="toggleCompetition(comp.id)"
                           class="w-4 h-4 rounded accent-blue-500">
                    <div>
                      <div class="text-white text-sm font-medium">{{ comp.name }}</div>
                      @if (comp.season) {
                        <div class="text-zinc-500 text-[10px]">{{ comp.season }}</div>
                      }
                    </div>
                  </label>
                }
                @if (availableCompetitions.length === 0) {
                  <div class="text-zinc-500 text-xs text-center py-3">Brak dostępnych rozgrywek</div>
                }
              </div>
            </div>
            @if (createError) {
              <div class="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{{ createError }}</div>
            }
            <div class="flex gap-3">
              <button (click)="showCreateLeague = false; createError = ''" class="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">Anuluj</button>
              <button (click)="createLeague()" [disabled]="!newLeagueName.trim() || selectedCompetitionIds.size === 0"
                      class="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                Stwórz
              </button>
            </div>
          </div>
        </div>
      }

      @if (leagueToDelete) {
        <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-zinc-900/90 backdrop-blur-2xl p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-2">{{ leagueToDelete.isOwner ? 'Usuń Ligę' : 'Opuść Ligę' }}</h3>
            <p class="text-zinc-400 text-sm mb-6">Czy na pewno chcesz {{ leagueToDelete.isOwner ? 'usunąć' : 'opuścić' }} ligę "{{ leagueToDelete.name }}"?</p>
            <div class="flex gap-3">
              <button (click)="leagueToDelete = null" class="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">Anuluj</button>
              <button (click)="executeDeleteOrLeave()" class="flex-1 py-3 px-4 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                {{ leagueToDelete.isOwner ? 'Usuń' : 'Opuść' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (inviteCodeModal) {
        <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-zinc-900/90 backdrop-blur-2xl p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl text-center">
            <h3 class="text-lg font-semibold text-white mb-2">Kod zaproszenia</h3>
            <p class="text-zinc-400 text-xs mb-4">Udostępnij ten kod innym graczom</p>
            <div class="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-blue-400 tracking-widest mb-4">
              {{ inviteCodeValue }}
            </div>
            <button (click)="inviteCodeModal = false" class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">Zamknij</button>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  private router = inject(Router);

  stats: any = null;
  showCreateLeague = false;
  newLeagueName = '';
  createError = '';
  availableCompetitions: any[] = [];
  selectedCompetitionIds = new Set<number>();
  leagueToDelete: LeagueSummary | null = null;
  inviteCodeModal = false;
  inviteCodeValue = '';

  async ngOnInit() {
    try {
      const data = await this.api.getMyStats();
      this.stats = data.stats;
    } catch {}
    await this.leagueState.loadLeagues();
  }

  async openCreateLeague() {
    this.showCreateLeague = true;
    this.selectedCompetitionIds.clear();
    try {
      this.availableCompetitions = await this.api.getCompetitions();
    } catch {
      this.availableCompetitions = [];
    }
  }

  toggleCompetition(id: number) {
    if (this.selectedCompetitionIds.has(id)) {
      this.selectedCompetitionIds.delete(id);
    } else {
      this.selectedCompetitionIds.add(id);
    }
  }

  async createLeague() {
    if (!this.newLeagueName.trim() || this.selectedCompetitionIds.size === 0) return;
    this.createError = '';
    try {
      const result = await this.api.createLeague(
        this.newLeagueName.trim(),
        Array.from(this.selectedCompetitionIds)
      );
      await this.leagueState.loadLeagues();
      this.leagueState.setActiveLeague(result.id);
      this.newLeagueName = '';
      this.selectedCompetitionIds.clear();
      this.showCreateLeague = false;
    } catch (e: any) {
      this.createError = e?.error?.error || 'Nie udało się stworzyć ligi';
    }
  }

  confirmDelete(league: LeagueSummary) {
    this.leagueToDelete = league;
  }

  confirmLeave(league: LeagueSummary) {
    this.leagueToDelete = league;
  }

  async executeDeleteOrLeave() {
    if (!this.leagueToDelete) return;
    try {
      if (this.leagueToDelete.isOwner) {
        await this.api.deleteLeague(this.leagueToDelete.id);
      } else {
        await this.api.leaveLeague(this.leagueToDelete.id);
      }
      await this.leagueState.loadLeagues();
    } catch {}
    this.leagueToDelete = null;
  }

  async showInviteCode(league: LeagueSummary) {
    try {
      const result = await this.api.getInviteCode(league.id);
      this.inviteCodeValue = result.inviteCode;
      this.inviteCodeModal = true;
    } catch {}
  }

  goToPredictions() {
    this.router.navigate(['/predictions']);
  }
}
