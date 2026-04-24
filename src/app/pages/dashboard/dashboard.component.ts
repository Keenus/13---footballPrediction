import { Component, inject, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { LeagueStateService, LeagueSummary } from '../../services/league-state.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, NgClass, FormsModule, RouterLink],
  template: `
    <div class="p-4 max-w-md mx-auto pt-3">

      <div class="grid grid-cols-2 gap-3">

        <!-- HERO: TYPUJ TERAZ -->
        @if (leagueState.activeLeague(); as activeLeague) {
          <div class="tile row-span-2 bg-gradient-to-br from-[#3a3530] to-[#262220] cursor-pointer min-h-[210px] flex flex-col border border-white/[0.06]"
               (click)="!activeLeague.isFinished && goToPredictions()">
            @if (tileImages.hero) {
              <img [src]="tileImages.hero" class="tile-img tile-img-lg" alt="">
            }
            <mat-icon class="tile-icon text-[120px] w-[120px] h-[120px] text-white">sports_soccer</mat-icon>
            <div class="relative z-[1] p-4 flex flex-col justify-between flex-1">
              <div>
                <div class="inline-flex items-center gap-1.5 bg-[#FEF400]/[0.08] text-[#FEF400] text-[9px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 mb-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#FEF400] animate-pulse"></span>
                  @if (!activeLeague.isFinished) { Na żywo } @else { Zakończona }
                </div>
                <h2 class="text-base font-black text-white leading-tight">
                  @if (!activeLeague.isFinished) { Typuj Teraz } @else { TypLiga Zakończona }
                </h2>
                <p class="text-white/35 text-[11px] mt-1 leading-snug">{{ activeLeague.name }}</p>
                @if (activeLeague.competitions.length > 0) {
                  <p class="text-white/20 text-[9px] mt-0.5">{{ activeLeague.competitions.map(c => c.name).join(', ') }}</p>
                }
              </div>
              <div class="flex items-center justify-between mt-3">
                @if (!activeLeague.isFinished) {
                  <span class="text-white/30 text-[10px] font-semibold flex items-center gap-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5">play_arrow</mat-icon> Graj
                  </span>
                }
                <div class="bg-white/[0.08] rounded-lg px-2.5 py-1 text-center ml-auto">
                  <span class="text-white font-black text-sm">{{ activeLeague.myPoints }}</span>
                  <span class="text-white/30 text-[9px] ml-1 font-bold">PKT</span>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="tile row-span-2 bg-[#262220] border border-white/[0.06] min-h-[210px] flex flex-col">
            @if (tileImages.hero) {
              <img [src]="tileImages.hero" class="tile-img tile-img-lg" alt="">
            }
            <mat-icon class="tile-icon text-[120px] w-[120px] h-[120px] text-white">sports_soccer</mat-icon>
            <div class="relative z-[1] p-4 flex flex-col justify-between flex-1">
              <div>
                <h2 class="text-base font-black text-white leading-tight">Typuj</h2>
                <p class="text-white/35 text-[11px] mt-1">Wybierz lub stwórz typligę aby zacząć</p>
              </div>
              <span class="text-white/20 text-[10px] font-semibold">Brak aktywnej typligi</span>
            </div>
          </div>
        }

        <!-- STATS TILE -->
        <div class="tile bg-[#262220] border border-white/[0.06]">
          @if (tileImages.stats) {
            <img [src]="tileImages.stats" class="tile-img tile-img-sm" alt="">
          }
          <mat-icon class="tile-icon text-[70px] w-[70px] h-[70px] text-white">emoji_events</mat-icon>
          <div class="relative z-[1] p-4">
            <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Statystyki</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-baseline">
                <span class="text-white/40 text-[10px] font-medium">Punkty</span>
                <span class="text-white font-black text-lg leading-none">{{ stats?.totalPoints || 0 }}</span>
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-white/40 text-[10px] font-medium">Dokładne</span>
                <span class="text-emerald-400 font-black text-lg leading-none">{{ stats?.exactScores || 0 }}</span>
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-white/40 text-[10px] font-medium">Trafione</span>
                <span class="text-[#FEF400]/80 font-black text-lg leading-none">{{ stats?.correctResults || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RANKING TILE -->
        <a routerLink="/ranking" class="tile bg-[#262220] border border-white/[0.06] block">
          @if (tileImages.ranking) {
            <img [src]="tileImages.ranking" class="tile-img tile-img-sm" alt="">
          }
          <mat-icon class="tile-icon text-[70px] w-[70px] h-[70px] text-[#FEF400]/30">military_tech</mat-icon>
          <div class="relative z-[1] p-4">
            <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ranking</h3>
            <p class="text-white/25 text-[10px] mt-1">Sprawdź pozycję</p>
          </div>
        </a>

        <!-- MOJE LIGI TILE -->
        <div class="tile row-span-2 bg-[#262220] border border-white/[0.06] flex flex-col">
          @if (tileImages.leagues) {
            <img [src]="tileImages.leagues" class="tile-img tile-img-lg" alt="">
          }
          <mat-icon class="tile-icon text-[90px] w-[90px] h-[90px] text-emerald-400/20">stadium</mat-icon>
          <div class="relative z-[1] p-4 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Moje typligi</h3>
              @if (auth.canCreateLeagues()) {
                <button (click)="openCreateLeague()" class="text-emerald-400/70 hover:text-emerald-400 transition-colors">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
                </button>
              }
            </div>
            <div class="space-y-1 flex-1 overflow-y-auto">
              @for (league of leagueState.myLeagues(); track league.id) {
                <div class="flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all group"
                     [ngClass]="{'bg-emerald-500/[0.08]': leagueState.activeLeagueId() === league.id, 'hover:bg-white/[0.04]': leagueState.activeLeagueId() !== league.id}"
                     (click)="leagueState.setActiveLeague(league.id)">
                  <div class="w-1 h-5 rounded-full shrink-0" [ngClass]="{'bg-emerald-400': leagueState.activeLeagueId() === league.id, 'bg-white/10': leagueState.activeLeagueId() !== league.id}"></div>
                  <div class="flex-1 min-w-0">
                    <div class="text-white/80 text-[11px] font-semibold truncate">{{ league.name }}</div>
                    <div class="text-white/20 text-[9px]">{{ league.memberCount }} graczy</div>
                  </div>
                  <div class="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="showInviteCode(league); $event.stopPropagation()" class="p-1 text-white/30 hover:text-[#FEF400]/70">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">share</mat-icon>
                    </button>
                    <button (click)="confirmDelete(league); $event.stopPropagation()" class="p-1 text-white/30 hover:text-red-400">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
              @if (leagueState.myLeagues().length === 0) {
                <p class="text-white/20 text-[10px] py-2">Brak typlig</p>
              }
            </div>
          </div>
        </div>

        <!-- DOŁĄCZ DO LIGI TILE -->
        <a routerLink="/join-league" class="tile bg-[#262220] border border-white/[0.06] block">
          @if (tileImages.join) {
            <img [src]="tileImages.join" class="tile-img tile-img-sm" alt="">
          }
          <mat-icon class="tile-icon text-[70px] w-[70px] h-[70px] text-cyan-400/20">group_add</mat-icon>
          <div class="relative z-[1] p-4">
            <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Dołącz</h3>
            <p class="text-white/25 text-[10px] mt-1">Wpisz kod zaproszenia</p>
          </div>
        </a>

        <!-- HISTORIA TILE -->
        <a routerLink="/history" class="tile bg-[#262220] border border-white/[0.06] block">
          @if (tileImages.history) {
            <img [src]="tileImages.history" class="tile-img tile-img-sm" alt="">
          }
          <mat-icon class="tile-icon text-[70px] w-[70px] h-[70px] text-purple-400/20">scoreboard</mat-icon>
          <div class="relative z-[1] p-4">
            <h3 class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Historia</h3>
            <p class="text-white/25 text-[10px] mt-1">Rozegrane kolejki</p>
          </div>
        </a>

      </div>

      <!-- JOINED LEAGUES -->
      @if (leagueState.joinedLeagues().length > 0) {
        <div class="mt-4 bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
          <h4 class="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Dołączyłem</h4>
          <div class="space-y-1">
            @for (league of leagueState.joinedLeagues(); track league.id) {
              <div class="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all"
                   [ngClass]="{'bg-[#FEF400]/[0.06]': leagueState.activeLeagueId() === league.id, 'hover:bg-white/[0.04]': leagueState.activeLeagueId() !== league.id}"
                   (click)="leagueState.setActiveLeague(league.id)">
                <div class="w-1 h-5 rounded-full" [ngClass]="{'bg-[#FEF400]/60': leagueState.activeLeagueId() === league.id, 'bg-white/10': leagueState.activeLeagueId() !== league.id}"></div>
                <span class="text-white/80 text-[11px] font-semibold flex-1 truncate">{{ league.name }}</span>
                <span class="text-white/20 text-[9px]">{{ league.memberCount }} graczy</span>
                <button (click)="confirmLeave(league); $event.stopPropagation()" class="p-1 text-white/20 hover:text-red-400 transition-colors">
                  <mat-icon class="text-[14px] w-3.5 h-3.5">exit_to_app</mat-icon>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- UPCOMING MATCHES -->
      @if (!!leagueState.activeLeague()) {
        <div class="mt-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <mat-icon class="text-[14px] w-3.5 h-3.5 text-[#FEF400]/50">schedule</mat-icon>
              Nadchodzące mecze
            </h3>
            @if (roundName) {
              <span class="text-[10px] font-medium text-white/20">{{ roundName }}</span>
            }
          </div>

          @if (loadingMatches) {
            <div class="flex items-center justify-center py-8">
              <mat-icon class="text-white/20 animate-spin text-[24px]">refresh</mat-icon>
            </div>
          } @else if (upcomingMatches.length > 0) {
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl overflow-hidden">
              @for (match of upcomingMatches; track match.id; let last = $last) {
                <div class="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                     [class.border-b]="!last" [class.border-white/[0.04]]="!last"
                     (click)="goToPredictions()">
                  <div class="w-12 shrink-0 text-center">
                    @if (match.isPlayed) {
                      <div class="text-emerald-400 text-[11px] font-black">{{ match.homeScore }}:{{ match.awayScore }}</div>
                      <div class="text-emerald-400/40 text-[8px] font-semibold uppercase">Koniec</div>
                    } @else if (match.deadline) {
                      <div class="text-white/70 text-[11px] font-bold">{{ formatMatchTime(match.deadline) }}</div>
                      <div class="text-white/25 text-[8px] font-semibold">{{ formatMatchDate(match.deadline) }}</div>
                    } @else {
                      <div class="text-white/30 text-[11px]">—</div>
                    }
                  </div>

                  <div class="w-[2px] h-8 rounded-full shrink-0"
                       [ngClass]="{'bg-emerald-400': match.isPlayed, 'bg-[#FEF400]/40': !match.isPlayed && !match.deadlinePassed, 'bg-white/10': match.deadlinePassed && !match.isPlayed}"></div>

                  <div class="flex-1 min-w-0">
                    <div class="text-white/80 text-[11px] font-semibold truncate">{{ match.homeTeam.name }}</div>
                    <div class="text-white/80 text-[11px] font-semibold truncate">{{ match.awayTeam.name }}</div>
                  </div>

                  <div class="shrink-0">
                    @if (match.prediction && match.prediction.homeScore !== null) {
                      <div class="bg-[#FEF400]/[0.08] rounded-lg px-2 py-1 text-center">
                        <span class="text-[#FEF400]/80 text-[10px] font-bold">{{ match.prediction.homeScore }}:{{ match.prediction.awayScore }}</span>
                      </div>
                    } @else if (!match.deadlinePassed && !match.isPlayed) {
                      <mat-icon class="text-white/15 text-[16px] w-4 h-4">edit</mat-icon>
                    } @else {
                      <span class="text-white/10 text-[9px]">—</span>
                    }
                  </div>
                </div>
              }

              @if (hasMoreMatches) {
                <button (click)="goToPredictions()" class="w-full py-3 text-center text-[#FEF400]/50 hover:text-[#FEF400]/70 text-[10px] font-bold uppercase tracking-widest transition-colors border-t border-white/[0.04]">
                  Wszystkie mecze
                  <mat-icon class="text-[12px] w-3 h-3 align-middle ml-0.5">chevron_right</mat-icon>
                </button>
              }
            </div>
          } @else if (isFinished) {
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-6 text-center">
              <mat-icon class="text-white/15 text-[28px] mb-1">done_all</mat-icon>
              <p class="text-white/30 text-xs font-medium">Rozgrywki zakończone</p>
            </div>
          } @else {
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-6 text-center">
              <mat-icon class="text-white/15 text-[28px] mb-1">event_busy</mat-icon>
              <p class="text-white/30 text-xs font-medium">Brak nadchodzących meczów</p>
            </div>
          }
        </div>
      }

      <!-- MODALS -->
      @if (showCreateLeague) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl shadow-black/50 p-6">
            <h3 class="text-lg font-black text-white mb-5">Nowa TypLiga</h3>
            <div class="mb-4">
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">Nazwa typligi</label>
              <input type="text" [(ngModel)]="newLeagueName" placeholder="np. Firmowa typliga"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all placeholder:text-white/20">
            </div>
            <div class="mb-6">
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">Wybierz rozgrywki</label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                @for (comp of availableCompetitions; track comp.id) {
                  <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                         [ngClass]="{'bg-[#FEF400]/[0.06] border-[#FEF400]/20': selectedCompetitionIds.has(comp.id), 'bg-black/15 border-white/[0.06] hover:border-white/10': !selectedCompetitionIds.has(comp.id)}">
                    <input type="checkbox" [checked]="selectedCompetitionIds.has(comp.id)" (change)="toggleCompetition(comp.id)"
                           class="w-4 h-4 rounded accent-[#FEF400]">
                    <div>
                      <div class="text-white/80 text-sm font-semibold">{{ comp.name }}</div>
                      @if (comp.season) {
                        <div class="text-white/30 text-[10px]">{{ comp.season }}</div>
                      }
                    </div>
                  </label>
                }
                @if (availableCompetitions.length === 0) {
                  <div class="text-white/30 text-xs text-center py-3">Brak dostępnych rozgrywek</div>
                }
              </div>
            </div>
            @if (createError) {
              <div class="mb-4 bg-red-500/10 border border-red-500/15 rounded-xl p-3 text-red-400 text-sm">{{ createError }}</div>
            }
            <div class="flex gap-3">
              <button (click)="showCreateLeague = false; createError = ''" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold rounded-xl transition-all">Anuluj</button>
              <button (click)="createLeague()" [disabled]="!newLeagueName.trim() || selectedCompetitionIds.size === 0"
                      class="flex-1 py-3 px-4 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-40 text-[#1E1A17] text-sm font-bold rounded-xl transition-all">
                Stwórz
              </button>
            </div>
          </div>
        </div>
      }

      @if (leagueToDelete) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl shadow-black/50 p-6">
            <h3 class="text-lg font-black text-white mb-2">{{ leagueToDelete.isOwner ? 'Usuń TypLigę' : 'Opuść TypLigę' }}</h3>
            <p class="text-white/50 text-sm mb-6">Czy na pewno chcesz {{ leagueToDelete.isOwner ? 'usunąć' : 'opuścić' }} typligę "{{ leagueToDelete.name }}"?</p>
            <div class="flex gap-3">
              <button (click)="leagueToDelete = null" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold rounded-xl transition-all">Anuluj</button>
              <button (click)="executeDeleteOrLeave()" class="flex-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-bold rounded-xl transition-all">
                {{ leagueToDelete.isOwner ? 'Usuń' : 'Opuść' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (inviteCodeModal) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl shadow-black/50 p-6 text-center">
            <h3 class="text-lg font-black text-white mb-2">Kod zaproszenia</h3>
            <p class="text-white/35 text-xs mb-4">Udostępnij ten kod innym graczom</p>
            <div class="bg-black/20 border border-white/[0.08] rounded-2xl px-4 py-4 text-2xl font-mono font-black text-[#FEF400]/80 tracking-[0.2em] mb-5">
              {{ inviteCodeValue }}
            </div>
            <button (click)="inviteCodeModal = false" class="w-full py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold rounded-xl transition-all">Zamknij</button>
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
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  stats: any = null;
  showCreateLeague = false;
  newLeagueName = '';
  createError = '';
  availableCompetitions: any[] = [];
  selectedCompetitionIds = new Set<number>();
  leagueToDelete: LeagueSummary | null = null;
  inviteCodeModal = false;
  inviteCodeValue = '';

  upcomingMatches: any[] = [];
  roundName = '';
  isFinished = false;
  loadingMatches = false;
  hasMoreMatches = false;

  tileImages = {
    hero:    '',
    stats:   '',
    ranking: '',
    leagues: '',
    join:    '',
    history: '',
  };

  private readonly MAX_MATCHES = 5;
  private lastLoadedLeagueId: number | null = null;

  constructor() {
    effect(() => {
      const league = this.leagueState.activeLeague();
      const id = league?.id ?? null;
      if (id !== this.lastLoadedLeagueId) {
        this.lastLoadedLeagueId = id;
        this.loadUpcomingMatches();
      }
    });
  }

  async ngOnInit() {
    try {
      const data = await this.api.getMyStats();
      this.stats = data.stats;
    } catch {}
    await this.leagueState.loadLeagues();
    this.cdr.markForCheck();
  }

  async loadUpcomingMatches() {
    const league = this.leagueState.activeLeague();
    if (!league) {
      this.upcomingMatches = [];
      this.cdr.markForCheck();
      return;
    }
    this.loadingMatches = true;
    this.cdr.markForCheck();
    try {
      const data = await this.api.getCurrentRound(league.id);
      this.isFinished = data.isFinished;
      if (data.round) {
        this.roundName = data.round.name || `Kolejka ${data.round.number}`;
        const all = data.round.matches || [];
        this.hasMoreMatches = all.length > this.MAX_MATCHES;
        this.upcomingMatches = all.slice(0, this.MAX_MATCHES);
      } else {
        this.roundName = '';
        this.upcomingMatches = [];
      }
    } catch {
      this.upcomingMatches = [];
    } finally {
      this.loadingMatches = false;
      this.cdr.markForCheck();
    }
  }

  formatMatchTime(deadline: string): string {
    const d = new Date(deadline);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  formatMatchDate(deadline: string): string {
    const d = new Date(deadline);
    return d.getDate().toString().padStart(2, '0') + '.' + (d.getMonth() + 1).toString().padStart(2, '0');
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
      this.toast.success('TypLiga utworzona pomyślnie');
      this.newLeagueName = '';
      this.selectedCompetitionIds.clear();
      this.showCreateLeague = false;
    } catch (e: any) {
      this.createError = e?.error?.error || 'Nie udało się stworzyć typligi';
    }
  }

  confirmDelete(league: LeagueSummary) { this.leagueToDelete = league; }
  confirmLeave(league: LeagueSummary) { this.leagueToDelete = league; }

  async executeDeleteOrLeave() {
    if (!this.leagueToDelete) return;
    const wasOwner = this.leagueToDelete.isOwner;
    try {
      if (wasOwner) { await this.api.deleteLeague(this.leagueToDelete.id); }
      else { await this.api.leaveLeague(this.leagueToDelete.id); }
      await this.leagueState.loadLeagues();
      this.toast.success(wasOwner ? 'TypLiga usunięta' : 'Opuszczono typligę');
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

  goToPredictions() { this.router.navigate(['/predictions']); }
}
