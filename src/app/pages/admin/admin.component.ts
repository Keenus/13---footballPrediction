import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

type AdminTab = 'competitions' | 'teams' | 'rounds' | 'matches' | 'results';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, NgClass, FormsModule, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Panel Admina" subtitle="Zarządzaj rozgrywkami, drużynami i meczami"></app-page-header>

      <!-- Tabs -->
      <div class="flex gap-1.5 mb-6">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab = tab.id; onTabChange()"
                  class="flex-1 py-3 px-1 rounded-xl transition-all flex flex-col items-center gap-1.5 border"
                  [ngClass]="{'bg-[#FEF400]/[0.08] border-[#FEF400]/15 text-[#FEF400]/80': activeTab === tab.id, 'bg-[#262220] border-white/[0.06] text-white/35 hover:text-white/50': activeTab !== tab.id}">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">{{ tab.icon }}</mat-icon>
            <span class="text-[9px] font-black uppercase tracking-widest">{{ tab.label }}</span>
          </button>
        }
      </div>

      <!-- COMPETITIONS TAB -->
      @if (activeTab === 'competitions') {
        <div class="space-y-4">
          <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
            <h3 class="text-white font-black uppercase tracking-tight text-sm mb-3 flex items-center gap-2">
              <mat-icon class="text-[#FEF400] text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
              Nowe rozgrywki
            </h3>
            <div class="space-y-3">
              <input type="text" [(ngModel)]="newComp.name" placeholder="Nazwa rozgrywek"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all placeholder:text-white/20">
              <div class="flex gap-2">
                <select [(ngModel)]="newComp.type"
                        class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                  <option value="tournament">Turniej</option>
                  <option value="league">Liga</option>
                  <option value="custom">Własne</option>
                </select>
                <input type="text" [(ngModel)]="newComp.season" placeholder="Sezon np. 2025/26"
                       class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all placeholder:text-white/20">
              </div>
              <button (click)="createCompetition()" [disabled]="!newComp.name.trim()"
                      class="w-full py-3 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-40 text-[#1E1A17] text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Utwórz
              </button>
            </div>
          </div>

          @if (loadingComps) {
            <div class="text-center text-white/50 py-6">
              <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
              <p class="text-xs">Ładowanie...</p>
            </div>
          }

          @for (comp of competitions; track comp.id) {
            <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
              <mat-icon class="absolute -right-2 -bottom-2 text-[80px] w-20 h-20 text-white opacity-[0.04] pointer-events-none">emoji_events</mat-icon>
              @if (editingCompId === comp.id) {
                <div class="space-y-3 relative z-10">
                  <input type="text" [(ngModel)]="editComp.name"
                         class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                  <div class="flex gap-2">
                    <select [(ngModel)]="editComp.type"
                            class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                      <option value="tournament">Turniej</option>
                      <option value="league">Liga</option>
                      <option value="custom">Własne</option>
                    </select>
                    <input type="text" [(ngModel)]="editComp.season" placeholder="Sezon"
                           class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all placeholder:text-white/20">
                  </div>
                  <label class="flex items-center gap-2 text-[10px] font-bold text-white/35 uppercase tracking-widest cursor-pointer">
                    <input type="checkbox" [(ngModel)]="editComp.isFinished" class="accent-[#FEF400]">
                    Zakończone
                  </label>
                  <div class="flex gap-2">
                    <button (click)="saveCompetition(comp.id)" class="flex-1 py-2.5 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] text-xs font-bold uppercase tracking-wider rounded-xl transition-all">Zapisz</button>
                    <button (click)="editingCompId = null" class="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">Anuluj</button>
                  </div>
                </div>
              } @else {
                <div class="flex items-start justify-between relative z-10">
                  <div>
                    <div class="font-black text-white text-sm">{{ comp.name }}</div>
                    <div class="text-[10px] text-white/35 mt-0.5 flex items-center gap-2">
                      <span class="px-1.5 py-0.5 bg-white/5 rounded-lg">{{ comp.type === 'tournament' ? 'Turniej' : comp.type === 'league' ? 'Liga' : 'Własne' }}</span>
                      @if (comp.season) { <span>{{ comp.season }}</span> }
                      <span>{{ comp.teams?.length || 0 }} drużyn</span>
                      @if (comp.isFinished) {
                        <span class="text-emerald-400 font-bold">Zakończone</span>
                      }
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <button (click)="startEditComp(comp)" class="p-2 text-white/25 hover:text-[#FEF400]/70 transition-colors rounded-lg">
                      <mat-icon class="text-[16px] w-4 h-4">edit</mat-icon>
                    </button>
                    <button (click)="confirmDeleteComp = comp" class="p-2 text-white/25 hover:text-red-400 transition-colors rounded-lg">
                      <mat-icon class="text-[16px] w-4 h-4">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          @if (!loadingComps && competitions.length === 0) {
            <div class="text-center py-8 text-white/35">
              <mat-icon class="text-4xl mb-2 opacity-30">emoji_events</mat-icon>
              <p class="text-xs">Brak rozgrywek. Utwórz pierwszą powyżej.</p>
            </div>
          }
        </div>
      }

      <!-- TEAMS TAB -->
      @if (activeTab === 'teams') {
        <div class="space-y-4">
          <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
            <label class="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-2">Wybierz rozgrywki</label>
            <select [(ngModel)]="selectedCompId" (ngModelChange)="onCompSelected()"
                    class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
              <option [ngValue]="null">-- Wybierz --</option>
              @for (comp of competitions; track comp.id) {
                <option [ngValue]="comp.id">{{ comp.name }} {{ comp.season ? '(' + comp.season + ')' : '' }}</option>
              }
            </select>
          </div>

          @if (selectedCompId) {
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
              <h3 class="text-white font-black uppercase tracking-tight text-sm mb-3 flex items-center gap-2">
                <mat-icon class="text-emerald-400 text-[18px] w-[18px] h-[18px]">group_add</mat-icon>
                Dodaj drużyny
              </h3>
              <div class="space-y-3">
                <textarea [(ngModel)]="newTeamsText" placeholder="Wpisz nazwy drużyn, każda w nowej linii"
                          rows="4"
                          class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all placeholder:text-white/20 resize-none"></textarea>
                <button (click)="addTeams()" [disabled]="!newTeamsText.trim()"
                        class="w-full py-3 bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 text-emerald-400 text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Dodaj drużyny
                </button>
              </div>
            </div>

            @if (loadingTeams) {
              <div class="text-center text-white/50 py-6">
                <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
              </div>
            }

            <div class="space-y-2">
              @for (team of selectedCompTeams; track team.id; let i = $index) {
                <div class="bg-white/[0.03] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span class="text-white/35 text-xs font-mono w-5 text-right">{{ i + 1 }}</span>
                  @if (editingTeamId === team.id) {
                    <input type="text" [(ngModel)]="editTeamName" (keyup.enter)="saveTeam(team.id)"
                           class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                    <button (click)="saveTeam(team.id)" class="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                      <mat-icon class="text-[16px] w-4 h-4">check</mat-icon>
                    </button>
                    <button (click)="editingTeamId = null" class="p-1.5 text-white/25 hover:bg-white/5 rounded-lg transition-colors">
                      <mat-icon class="text-[16px] w-4 h-4">close</mat-icon>
                    </button>
                  } @else {
                    <span class="flex-1 text-white text-sm font-bold">{{ team.name }}</span>
                    <button (click)="editingTeamId = team.id; editTeamName = team.name" class="p-1.5 text-white/25 hover:text-[#FEF400]/70 rounded-lg transition-colors">
                      <mat-icon class="text-[16px] w-4 h-4">edit</mat-icon>
                    </button>
                    <button (click)="confirmDeleteTeam = team" class="p-1.5 text-white/25 hover:text-red-400 rounded-lg transition-colors">
                      <mat-icon class="text-[16px] w-4 h-4">delete</mat-icon>
                    </button>
                  }
                </div>
              }
            </div>

            @if (!loadingTeams && selectedCompTeams.length === 0) {
              <div class="text-center py-8 text-white/35">
                <mat-icon class="text-4xl mb-2 opacity-30">groups</mat-icon>
                <p class="text-xs">Brak drużyn. Dodaj je powyżej.</p>
              </div>
            }
          } @else {
            <div class="text-center py-10 text-white/35">
              <mat-icon class="text-4xl mb-2 opacity-30">arrow_upward</mat-icon>
              <p class="text-xs">Wybierz rozgrywki, aby zarządzać drużynami</p>
            </div>
          }
        </div>
      }

      <!-- ROUNDS TAB -->
      @if (activeTab === 'rounds') {
        <div class="space-y-4">
          <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
            <label class="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-2">Wybierz rozgrywki</label>
            <select [(ngModel)]="selectedCompId" (ngModelChange)="onCompSelected()"
                    class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
              <option [ngValue]="null">-- Wybierz --</option>
              @for (comp of competitions; track comp.id) {
                <option [ngValue]="comp.id">{{ comp.name }} {{ comp.season ? '(' + comp.season + ')' : '' }}</option>
              }
            </select>
          </div>

          @if (selectedCompId) {
            <!-- New round form -->
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
              <h3 class="text-white font-black uppercase tracking-tight text-sm mb-3 flex items-center gap-2">
                <mat-icon class="text-[#FEF400] text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
                Nowa kolejka
              </h3>
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="newRoundName" placeholder="Nazwa kolejki (opcjonalnie)"
                       (keyup.enter)="createRound()"
                       class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all placeholder:text-white/20">
                <button (click)="createRound()"
                        class="shrink-0 px-4 py-3 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 active:scale-95">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Dodaj
                </button>
              </div>
            </div>

            @if (loadingRounds) {
              <div class="text-center text-white/50 py-6">
                <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
                <p class="text-xs">Ładowanie kolejek...</p>
              </div>
            }

            @for (round of selectedCompRounds; track round.id) {
              <div class="bg-[#262220] border border-white/[0.06] rounded-2xl overflow-hidden">
                <!-- Round header -->
                <div class="px-4 py-3 flex items-center gap-2">
                  @if (editingRoundId === round.id) {
                    <input type="text" [(ngModel)]="editRoundName" (keyup.enter)="saveRoundName(round.id)"
                           class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                    <button (click)="saveRoundName(round.id)" class="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors shrink-0">
                      <mat-icon class="text-[16px] w-4 h-4">check</mat-icon>
                    </button>
                    <button (click)="editingRoundId = null" class="p-1.5 text-white/25 hover:bg-white/5 rounded-lg transition-colors shrink-0">
                      <mat-icon class="text-[16px] w-4 h-4">close</mat-icon>
                    </button>
                  } @else {
                    <button (click)="toggleAdminRound(round.id)" class="flex-1 flex items-center gap-2 text-left min-w-0">
                      <span class="text-white/35 text-xs font-mono shrink-0">{{ round.number }}.</span>
                      <span class="text-white font-black text-sm truncate">{{ round.name || 'Kolejka ' + round.number }}</span>
                      <span class="text-white/25 text-[10px] shrink-0">{{ round.matches.length }} meczów</span>
                      @if (round.isCompleted) {
                        <span class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-bold shrink-0">OK</span>
                      }
                      <mat-icon class="text-white/35 text-[18px] w-[18px] h-[18px] ml-auto shrink-0 transition-transform"
                                [ngClass]="{'rotate-180': expandedAdminRoundId === round.id}">expand_more</mat-icon>
                    </button>
                    <button (click)="editingRoundId = round.id; editRoundName = round.name || ''" class="p-1.5 text-white/25 hover:text-[#FEF400]/70 rounded-lg transition-colors shrink-0">
                      <mat-icon class="text-[16px] w-4 h-4">edit</mat-icon>
                    </button>
                    <button (click)="confirmDeleteRound = round" class="p-1.5 text-white/25 hover:text-red-400 rounded-lg transition-colors shrink-0">
                      <mat-icon class="text-[16px] w-4 h-4">delete</mat-icon>
                    </button>
                  }
                </div>

                @if (expandedAdminRoundId === round.id) {
                  <div class="border-t border-white/[0.06] p-4 space-y-2">
                    <!-- Matches in this round -->
                    @for (match of round.matches; track match.id) {
                      <div class="bg-black/20 rounded-xl px-3 py-2.5 flex items-center gap-2"
                           [ngClass]="{'border border-emerald-400/15': match.isPlayed}">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="text-white text-xs font-bold truncate">{{ match.homeTeam.name }}</span>
                            @if (match.isPlayed) {
                              <span class="text-emerald-400 text-xs font-bold shrink-0">{{ match.homeScore }}:{{ match.awayScore }}</span>
                            } @else {
                              <span class="text-white/25 text-xs shrink-0">vs</span>
                            }
                            <span class="text-white text-xs font-bold truncate">{{ match.awayTeam.name }}</span>
                          </div>
                          @if (match.deadline) {
                            <div class="text-white/25 text-[10px] mt-0.5">{{ formatDate(match.deadline) }}</div>
                          }
                        </div>
                        @if (!match.isPlayed) {
                          <button (click)="confirmDeleteRoundMatch = match" class="p-1.5 text-white/25 hover:text-red-400 rounded-lg transition-colors shrink-0">
                            <mat-icon class="text-[14px] w-3.5 h-3.5">delete</mat-icon>
                          </button>
                        }
                      </div>
                    }

                    @if (round.matches.length === 0) {
                      <div class="text-white/25 text-xs text-center py-3">
                        <mat-icon class="text-2xl mb-1 opacity-30">sports_soccer</mat-icon>
                        <p>Brak meczów w tej kolejce</p>
                      </div>
                    }

                    <!-- Add match to round -->
                    @if (addingMatchToRoundId === round.id) {
                      <div class="mt-3 bg-black/20 rounded-xl p-3 space-y-2 border border-white/[0.06]">
                        <div class="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1">Dodaj mecz do kolejki</div>
                        <div class="flex gap-2 items-center">
                          <select [(ngModel)]="newRoundMatch.homeTeamId"
                                  class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                            <option [ngValue]="null">Gospodarz</option>
                            @for (team of selectedCompTeams; track team.id) {
                              <option [ngValue]="team.id">{{ team.name }}</option>
                            }
                          </select>
                          <span class="text-white/25 font-bold text-[10px] shrink-0">vs</span>
                          <select [(ngModel)]="newRoundMatch.awayTeamId"
                                  class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                            <option [ngValue]="null">Gość</option>
                            @for (team of selectedCompTeams; track team.id) {
                              <option [ngValue]="team.id">{{ team.name }}</option>
                            }
                          </select>
                        </div>
                        <div>
                          <label class="block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Deadline (opcjonalnie)</label>
                          <input type="datetime-local" [(ngModel)]="newRoundMatch.deadline"
                                 class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                        </div>
                        @if (roundMatchError) {
                          <div class="bg-red-500/10 border border-red-500/15 rounded-xl p-2 text-red-400 text-xs text-center">{{ roundMatchError }}</div>
                        }
                        <div class="flex gap-2">
                          <button (click)="addMatchToRound(round.id)"
                                  [disabled]="!newRoundMatch.homeTeamId || !newRoundMatch.awayTeamId || newRoundMatch.homeTeamId === newRoundMatch.awayTeamId"
                                  class="flex-1 py-2.5 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-40 text-[#1E1A17] text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                            Dodaj mecz
                          </button>
                          <button (click)="addingMatchToRoundId = null; roundMatchError = ''"
                                  class="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                            Anuluj
                          </button>
                        </div>
                      </div>
                    } @else {
                      <button (click)="startAddMatchToRound(round.id)"
                              [disabled]="selectedCompTeams.length < 2"
                              class="w-full mt-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 border border-dashed border-white/[0.1] rounded-xl text-white/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                        <mat-icon class="text-[16px] w-4 h-4">add</mat-icon> Dodaj mecz do kolejki
                      </button>
                    }
                  </div>
                }
              </div>
            }

            @if (!loadingRounds && selectedCompRounds.length === 0) {
              <div class="text-center py-8 text-white/35">
                <mat-icon class="text-4xl mb-2 opacity-30">format_list_numbered</mat-icon>
                <p class="text-xs">Brak kolejek. Utwórz pierwszą powyżej.</p>
              </div>
            }
          } @else {
            <div class="text-center py-10 text-white/35">
              <mat-icon class="text-4xl mb-2 opacity-30">arrow_upward</mat-icon>
              <p class="text-xs">Wybierz rozgrywki, aby zarządzać kolejkami</p>
            </div>
          }
        </div>
      }

      <!-- MATCHES TAB -->
      @if (activeTab === 'matches') {
        <div class="space-y-4">
          <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
            <label class="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-2">Wybierz rozgrywki</label>
            <select [(ngModel)]="selectedCompId" (ngModelChange)="onCompSelected()"
                    class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
              <option [ngValue]="null">-- Wybierz --</option>
              @for (comp of competitions; track comp.id) {
                <option [ngValue]="comp.id">{{ comp.name }} {{ comp.season ? '(' + comp.season + ')' : '' }}</option>
              }
            </select>
          </div>

          @if (selectedCompId && selectedCompTeams.length >= 2) {
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-4">
              <h3 class="text-white font-black uppercase tracking-tight text-sm mb-3 flex items-center gap-2">
                <mat-icon class="text-[#FEF400] text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
                Nowy mecz
              </h3>
              <div class="space-y-3">
                <div class="flex gap-2 items-center">
                  <select [(ngModel)]="newMatch.homeTeamId"
                          class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                    <option [ngValue]="null">Gospodarz</option>
                    @for (team of selectedCompTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                  <span class="text-white/35 font-bold text-xs">vs</span>
                  <select [(ngModel)]="newMatch.awayTeamId"
                          class="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                    <option [ngValue]="null">Gość</option>
                    @for (team of selectedCompTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                </div>
                @if (selectedCompRounds.length > 0) {
                  <div>
                    <label class="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1">Kolejka</label>
                    <select [(ngModel)]="newMatch.roundId"
                            class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                      <option [ngValue]="null">Automatycznie (pierwsza kolejka)</option>
                      @for (round of selectedCompRounds; track round.id) {
                        <option [ngValue]="round.id">{{ round.number }}. {{ round.name || 'Kolejka ' + round.number }}</option>
                      }
                    </select>
                  </div>
                }
                <div>
                  <label class="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1">Deadline (opcjonalnie)</label>
                  <input type="datetime-local" [(ngModel)]="newMatch.deadline"
                         class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 transition-all">
                </div>
                <button (click)="addMatch()" [disabled]="!newMatch.homeTeamId || !newMatch.awayTeamId || newMatch.homeTeamId === newMatch.awayTeamId"
                        class="w-full py-3 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-40 text-[#1E1A17] text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Dodaj mecz
                </button>
              </div>

              @if (matchError) {
                <div class="mt-3 bg-red-500/10 border border-red-500/15 rounded-xl p-3 text-red-400 text-xs text-center">{{ matchError }}</div>
              }
              @if (matchSuccess) {
                <div class="mt-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl p-3 text-emerald-400 text-xs text-center">{{ matchSuccess }}</div>
              }
            </div>

            @if (loadingMatches) {
              <div class="text-center text-white/50 py-6">
                <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
              </div>
            }

            @if (selectedCompMatches.length > 0) {
              <div class="space-y-2">
                <h3 class="text-zinc-100 font-black text-xs uppercase tracking-widest">Mecze ({{ selectedCompMatches.length }})</h3>
                @for (match of selectedCompMatches; track match.id) {
                  <div class="bg-[#262220] border border-white/[0.06] rounded-xl p-3"
                       [ngClass]="{'border-emerald-400/15': match.isPlayed}">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 text-right">
                        <span class="text-white text-xs font-bold">{{ match.homeTeam.name }}</span>
                      </div>
                      @if (match.isPlayed) {
                        <div class="px-2 py-1 bg-emerald-500/20 rounded-lg">
                          <span class="text-emerald-400 text-xs font-bold">{{ match.homeScore }} : {{ match.awayScore }}</span>
                        </div>
                      } @else {
                        <div class="px-2 py-1 bg-white/5 rounded-lg">
                          <span class="text-white/35 text-xs font-bold">vs</span>
                        </div>
                      }
                      <div class="flex-1">
                        <span class="text-white text-xs font-bold">{{ match.awayTeam.name }}</span>
                      </div>
                      <button (click)="confirmDeleteMatch = match" class="p-1.5 text-white/25 hover:text-red-400 rounded-lg transition-colors shrink-0">
                        <mat-icon class="text-[14px] w-3.5 h-3.5">delete</mat-icon>
                      </button>
                    </div>
                    <div class="flex items-center justify-center gap-3 mt-1.5">
                      @if (match.roundName) {
                        <span class="text-white/25 text-[10px]">{{ match.roundName }}</span>
                      }
                      @if (match.deadline) {
                        <span class="text-white/35 text-[10px]">Deadline: {{ formatDate(match.deadline) }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else if (!loadingMatches) {
              <div class="text-center py-8 text-white/35">
                <mat-icon class="text-4xl mb-2 opacity-30">sports_soccer</mat-icon>
                <p class="text-xs">Brak meczów. Dodaj pierwszy powyżej.</p>
              </div>
            }
          } @else if (selectedCompId && selectedCompTeams.length < 2) {
            <div class="text-center py-10 text-white/35">
              <mat-icon class="text-4xl mb-2 opacity-30">warning</mat-icon>
              <p class="text-xs">Najpierw dodaj min. 2 drużyny w zakładce Drużyny</p>
            </div>
          } @else {
            <div class="text-center py-10 text-white/35">
              <mat-icon class="text-4xl mb-2 opacity-30">arrow_upward</mat-icon>
              <p class="text-xs">Wybierz rozgrywki, aby zarządzać meczami</p>
            </div>
          }
        </div>
      }

      <!-- RESULTS TAB -->
      @if (activeTab === 'results') {
        @if (loadingComps) {
          <div class="text-center text-white/50 py-10">
            <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
            <p class="text-sm">Ładowanie rozgrywek...</p>
          </div>
        } @else {
          @for (comp of competitions; track comp.id) {
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <mat-icon class="text-[#FEF400] text-[20px] w-5 h-5">emoji_events</mat-icon>
                <h2 class="text-white font-black uppercase tracking-tight text-sm">{{ comp.name }}</h2>
                <span class="text-white/35 text-[10px] ml-auto">{{ comp.season }}</span>
              </div>

              @if (resultsComp && resultsComp.id === comp.id) {
                <div class="space-y-4">
                  @for (round of resultsComp.rounds; track round.id) {
                    <div class="bg-[#262220] border border-white/[0.06] rounded-2xl overflow-hidden">
                      <button (click)="toggleRound(round.id)" class="w-full px-4 py-3 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                          <h4 class="text-white text-xs font-black uppercase tracking-tight">{{ round.name || 'Runda ' + round.number }}</h4>
                          @if (round.isCompleted) {
                            <span class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-bold">OK</span>
                          } @else if (hasPlayedMatches(round)) {
                            <span class="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-lg text-[9px] font-bold">W trakcie</span>
                          }
                        </div>
                        <mat-icon class="text-white/35 text-[18px] w-[18px] h-[18px] transition-transform"
                                  [ngClass]="{'rotate-180': expandedRoundId === round.id}">expand_more</mat-icon>
                      </button>

                      @if (expandedRoundId === round.id) {
                        <div class="border-t border-white/[0.06] p-4">
                          @if (round.matches.length === 0) {
                            <div class="text-white/35 text-xs text-center py-4">
                              <mat-icon class="text-2xl mb-1 opacity-30">help_outline</mat-icon>
                              <p>Brak meczów</p>
                            </div>
                          }

                          <div class="space-y-3">
                            @for (match of round.matches; track match.id) {
                              <div class="rounded-xl p-3 border transition-all"
                                   [ngClass]="{'bg-[#262220] border-emerald-400/15': match.isPlayed, 'bg-black/20 border-white/[0.06]': !match.isPlayed}">
                                <div class="flex items-center gap-2">
                                  <span class="text-white text-xs font-bold flex-1 text-right truncate">{{ match.homeTeam.name }}</span>
                                  <div class="flex items-center gap-1 shrink-0">
                                    <input type="number" min="0" [(ngModel)]="matchScores[match.id].home" placeholder="-"
                                           class="w-10 h-9 bg-black/20 border border-white/[0.08] rounded-xl text-center text-sm font-bold text-white focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 outline-none transition-all">
                                    <span class="text-white/35 text-xs font-bold">:</span>
                                    <input type="number" min="0" [(ngModel)]="matchScores[match.id].away" placeholder="-"
                                           class="w-10 h-9 bg-black/20 border border-white/[0.08] rounded-xl text-center text-sm font-bold text-white focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 outline-none transition-all">
                                  </div>
                                  <span class="text-white text-xs font-bold flex-1 truncate">{{ match.awayTeam.name }}</span>
                                </div>
                                @if (match.isPlayed) {
                                  <div class="flex items-center justify-center gap-1 mt-2">
                                    <mat-icon class="text-emerald-400 text-[12px] w-3 h-3">check_circle</mat-icon>
                                    <span class="text-emerald-400 text-[10px] font-bold">Zapisano {{ match.homeScore }}:{{ match.awayScore }}</span>
                                  </div>
                                }
                              </div>
                            }
                          </div>

                          @if (round.matches.length > 0) {
                            <button (click)="saveResults(comp.id, round)" [disabled]="savingRoundId === round.id"
                                    class="w-full mt-4 py-3 px-4 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-50 text-[#1E1A17] text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                              @if (savingRoundId === round.id) {
                                <mat-icon class="animate-spin text-[18px] w-[18px] h-[18px]">refresh</mat-icon>
                                Zapisuję...
                              } @else {
                                <mat-icon class="text-[18px] w-[18px] h-[18px]">check</mat-icon>
                                Zapisz wyniki i nalicz punkty
                              }
                            </button>
                          }

                          @if (savedRoundId === round.id) {
                            <div class="mt-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl p-3 text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-2">
                              <mat-icon class="text-[16px] w-4 h-4">done_all</mat-icon>
                              Punkty naliczone we wszystkich ligach!
                            </div>
                          }

                          @if (saveError && errorRoundId === round.id) {
                            <div class="mt-3 bg-red-500/10 border border-red-500/15 rounded-xl p-3 text-red-400 text-xs text-center">
                              {{ saveError }}
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else {
                <button (click)="loadResults(comp.id)"
                        class="w-full py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] rounded-xl text-white/50 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <mat-icon class="text-[16px] w-4 h-4">visibility</mat-icon>
                  Pokaż mecze i wpisz wyniki
                </button>
              }
            </div>
          }

          @if (competitions.length === 0) {
            <div class="text-center py-10 text-white/35">
              <mat-icon class="text-4xl mb-2 opacity-30">sports_soccer</mat-icon>
              <p class="text-xs">Brak rozgrywek</p>
            </div>
          }
        }
      }

      <!-- Delete competition modal -->
      @if (confirmDeleteComp) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] p-6 rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl">
            <h3 class="text-lg font-black uppercase tracking-tight text-white mb-2">Usuń rozgrywki</h3>
            <p class="text-white/50 text-sm mb-1">Czy na pewno chcesz usunąć <span class="text-white font-bold">{{ confirmDeleteComp.name }}</span>?</p>
            <p class="text-red-400 text-xs mb-6">Spowoduje to usunięcie wszystkich drużyn, meczów i typowań.</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteComp = null" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Anuluj</button>
              <button (click)="deleteCompetition()" class="flex-1 py-3 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete team modal -->
      @if (confirmDeleteTeam) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] p-6 rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl">
            <h3 class="text-lg font-black uppercase tracking-tight text-white mb-2">Usuń drużynę</h3>
            <p class="text-white/50 text-sm mb-1">Czy na pewno chcesz usunąć <span class="text-white font-bold">{{ confirmDeleteTeam.name }}</span>?</p>
            <p class="text-red-400 text-xs mb-6">Usunięte zostaną też mecze tej drużyny.</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteTeam = null" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Anuluj</button>
              <button (click)="deleteTeam()" class="flex-1 py-3 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete match modal -->
      @if (confirmDeleteMatch) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] p-6 rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl">
            <h3 class="text-lg font-black uppercase tracking-tight text-white mb-2">Usuń mecz</h3>
            <p class="text-white/50 text-sm mb-6">{{ confirmDeleteMatch.homeTeam.name }} vs {{ confirmDeleteMatch.awayTeam.name }}</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteMatch = null" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Anuluj</button>
              <button (click)="deleteMatch()" class="flex-1 py-3 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete round modal -->
      @if (confirmDeleteRound) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] p-6 rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl">
            <h3 class="text-lg font-black uppercase tracking-tight text-white mb-2">Usuń kolejkę</h3>
            <p class="text-white/50 text-sm mb-1">Czy na pewno chcesz usunąć
              <span class="text-white font-bold">{{ confirmDeleteRound.name || 'Kolejkę ' + confirmDeleteRound.number }}</span>?
            </p>
            @if (confirmDeleteRound.matches?.length > 0) {
              <p class="text-amber-400 text-xs mb-6">Usunięte zostaną też {{ confirmDeleteRound.matches.length }} mecze tej kolejki.</p>
            } @else {
              <p class="text-white/35 text-xs mb-6">Kolejka jest pusta.</p>
            }
            @if (deleteRoundError) {
              <div class="mb-4 bg-red-500/10 border border-red-500/15 rounded-xl p-3 text-red-400 text-xs text-center">{{ deleteRoundError }}</div>
            }
            <div class="flex gap-3">
              <button (click)="confirmDeleteRound = null; deleteRoundError = ''" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Anuluj</button>
              <button (click)="deleteRoundConfirmed()" class="flex-1 py-3 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete match from round modal -->
      @if (confirmDeleteRoundMatch) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#2a2520] p-6 rounded-3xl max-w-sm w-full border border-white/[0.08] shadow-2xl">
            <h3 class="text-lg font-black uppercase tracking-tight text-white mb-2">Usuń mecz</h3>
            <p class="text-white/50 text-sm mb-6">{{ confirmDeleteRoundMatch.homeTeam.name }} vs {{ confirmDeleteRoundMatch.awayTeam.name }}</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteRoundMatch = null" class="flex-1 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Anuluj</button>
              <button (click)="deleteRoundMatch()" class="flex-1 py-3 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-bold uppercase tracking-wider rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'competitions', label: 'Rozgrywki', icon: 'emoji_events' },
    { id: 'teams', label: 'Drużyny', icon: 'groups' },
    { id: 'rounds', label: 'Kolejki', icon: 'format_list_numbered' },
    { id: 'matches', label: 'Mecze', icon: 'sports_soccer' },
    { id: 'results', label: 'Wyniki', icon: 'scoreboard' },
  ];

  activeTab: AdminTab = 'competitions';
  competitions: any[] = [];
  loadingComps = true;

  newComp = { name: '', type: 'tournament', season: '' };
  editingCompId: number | null = null;
  editComp = { name: '', type: 'tournament', season: '', isFinished: false };
  confirmDeleteComp: any = null;

  selectedCompId: number | null = null;
  selectedCompTeams: any[] = [];
  newTeamsText = '';
  editingTeamId: number | null = null;
  editTeamName = '';
  confirmDeleteTeam: any = null;
  loadingTeams = false;

  // Rounds tab
  selectedCompRounds: any[] = [];
  loadingRounds = false;
  newRoundName = '';
  expandedAdminRoundId: number | null = null;
  editingRoundId: number | null = null;
  editRoundName = '';
  confirmDeleteRound: any = null;
  deleteRoundError = '';
  addingMatchToRoundId: number | null = null;
  newRoundMatch: { homeTeamId: number | null; awayTeamId: number | null; deadline: string } = {
    homeTeamId: null, awayTeamId: null, deadline: '',
  };
  roundMatchError = '';
  confirmDeleteRoundMatch: any = null;

  selectedCompMatches: any[] = [];
  newMatch: { homeTeamId: number | null; awayTeamId: number | null; deadline: string; roundId: number | null } = {
    homeTeamId: null, awayTeamId: null, deadline: '', roundId: null,
  };
  confirmDeleteMatch: any = null;
  loadingMatches = false;
  matchError = '';
  matchSuccess = '';

  resultsComp: any = null;
  expandedRoundId: number | null = null;
  matchScores: Record<number, { home: number | null; away: number | null }> = {};
  savingRoundId: number | null = null;
  savedRoundId: number | null = null;
  saveError = '';
  errorRoundId: number | null = null;

  async ngOnInit() {
    await this.loadCompetitions();
  }

  async loadCompetitions() {
    this.loadingComps = true;
    try {
      this.competitions = await this.api.getCompetitions();
    } catch {
      this.competitions = [];
    } finally {
      this.loadingComps = false;
    }
  }

  onTabChange() {
    if (['teams', 'matches', 'rounds'].includes(this.activeTab)) {
      if (this.selectedCompId) {
        this.onCompSelected();
      }
    }
  }

  async createCompetition() {
    if (!this.newComp.name.trim()) return;
    try {
      await this.api.createCompetition({
        name: this.newComp.name.trim(),
        type: this.newComp.type,
        season: this.newComp.season.trim() || undefined,
      });
      this.newComp = { name: '', type: 'tournament', season: '' };
      this.toast.success('Rozgrywki utworzone');
      await this.loadCompetitions();
    } catch {}
  }

  startEditComp(comp: any) {
    this.editingCompId = comp.id;
    this.editComp = { name: comp.name, type: comp.type, season: comp.season || '', isFinished: comp.isFinished };
  }

  async saveCompetition(compId: number) {
    try {
      await this.api.updateCompetition(compId, {
        name: this.editComp.name.trim(),
        type: this.editComp.type,
        season: this.editComp.season.trim() || undefined,
        isFinished: this.editComp.isFinished,
      });
      this.editingCompId = null;
      this.toast.success('Rozgrywki zaktualizowane');
      await this.loadCompetitions();
    } catch {}
  }

  async deleteCompetition() {
    if (!this.confirmDeleteComp) return;
    const deletedId = this.confirmDeleteComp.id;
    try {
      await this.api.deleteCompetition(deletedId);
      if (this.selectedCompId === deletedId) {
        this.selectedCompId = null;
        this.selectedCompTeams = [];
        this.selectedCompMatches = [];
        this.selectedCompRounds = [];
      }
      this.toast.success('Rozgrywki usunięte');
      await this.loadCompetitions();
    } catch {}
    this.confirmDeleteComp = null;
  }

  async onCompSelected() {
    if (!this.selectedCompId) {
      this.selectedCompTeams = [];
      this.selectedCompMatches = [];
      this.selectedCompRounds = [];
      return;
    }
    await this.loadTeamsAndMatches();
  }

  async loadTeamsAndMatches() {
    if (!this.selectedCompId) return;
    this.loadingTeams = true;
    this.loadingMatches = true;
    this.loadingRounds = true;
    try {
      const comp = await this.api.getCompetition(this.selectedCompId);
      this.selectedCompTeams = comp.teams || [];
      this.selectedCompRounds = comp.rounds || [];

      const matches = await this.api.getMatches(this.selectedCompId);
      this.selectedCompMatches = matches;
    } catch {
      this.selectedCompTeams = [];
      this.selectedCompMatches = [];
      this.selectedCompRounds = [];
    } finally {
      this.loadingTeams = false;
      this.loadingMatches = false;
      this.loadingRounds = false;
    }
  }

  async addTeams() {
    if (!this.selectedCompId || !this.newTeamsText.trim()) return;
    const names = this.newTeamsText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) return;

    try {
      await this.api.addCompetitionTeams(this.selectedCompId, names);
      this.newTeamsText = '';
      this.toast.success(`Dodano ${names.length} drużyn`);
      await this.loadTeamsAndMatches();
      await this.loadCompetitions();
    } catch {}
  }

  async saveTeam(teamId: number) {
    if (!this.selectedCompId || !this.editTeamName.trim()) return;
    try {
      await this.api.updateTeam(this.selectedCompId, teamId, this.editTeamName.trim());
      this.editingTeamId = null;
      this.toast.success('Drużyna zaktualizowana');
      await this.loadTeamsAndMatches();
      await this.loadCompetitions();
    } catch {}
  }

  async deleteTeam() {
    if (!this.selectedCompId || !this.confirmDeleteTeam) return;
    const teamId = this.confirmDeleteTeam.id;
    this.confirmDeleteTeam = null;
    try {
      await this.api.deleteTeam(this.selectedCompId, teamId);
      this.toast.success('Drużyna usunięta');
      await this.loadTeamsAndMatches();
      await this.loadCompetitions();
    } catch {}
  }

  // ---- Rounds management ----

  async createRound() {
    if (!this.selectedCompId) return;
    const nextNumber = this.selectedCompRounds.length + 1;
    try {
      await this.api.addCompetitionRound(this.selectedCompId, {
        number: nextNumber,
        name: this.newRoundName.trim() || undefined,
      });
      this.newRoundName = '';
      this.toast.success('Kolejka utworzona');
      await this.loadTeamsAndMatches();
    } catch {}
  }

  toggleAdminRound(roundId: number) {
    this.expandedAdminRoundId = this.expandedAdminRoundId === roundId ? null : roundId;
    this.addingMatchToRoundId = null;
    this.roundMatchError = '';
  }

  async saveRoundName(roundId: number) {
    if (!this.selectedCompId) return;
    try {
      await this.api.updateRound(this.selectedCompId, roundId, { name: this.editRoundName.trim() });
      this.editingRoundId = null;
      this.toast.success('Kolejka zaktualizowana');
      await this.loadTeamsAndMatches();
    } catch {}
  }

  async deleteRoundConfirmed() {
    if (!this.selectedCompId || !this.confirmDeleteRound) return;
    this.deleteRoundError = '';
    try {
      await this.api.deleteRound(this.selectedCompId, this.confirmDeleteRound.id);
      if (this.expandedAdminRoundId === this.confirmDeleteRound.id) {
        this.expandedAdminRoundId = null;
      }
      this.toast.success('Kolejka usunięta');
      this.confirmDeleteRound = null;
      await this.loadTeamsAndMatches();
    } catch (e: any) {
      this.deleteRoundError = e?.error?.error || 'Błąd usuwania kolejki';
    }
  }

  startAddMatchToRound(roundId: number) {
    this.addingMatchToRoundId = roundId;
    this.newRoundMatch = { homeTeamId: null, awayTeamId: null, deadline: '' };
    this.roundMatchError = '';
  }

  async addMatchToRound(roundId: number) {
    if (!this.selectedCompId || !this.newRoundMatch.homeTeamId || !this.newRoundMatch.awayTeamId) return;
    this.roundMatchError = '';
    try {
      await this.api.addMatch(this.selectedCompId, {
        homeTeamId: this.newRoundMatch.homeTeamId,
        awayTeamId: this.newRoundMatch.awayTeamId,
        deadline: this.newRoundMatch.deadline || undefined,
        roundId,
      });
      this.toast.success('Mecz dodany do kolejki');
      this.newRoundMatch = { homeTeamId: null, awayTeamId: null, deadline: '' };
      this.addingMatchToRoundId = null;
      await this.loadTeamsAndMatches();
    } catch (e: any) {
      this.roundMatchError = e?.error?.error || 'Błąd dodawania meczu';
    }
  }

  async deleteRoundMatch() {
    if (!this.selectedCompId || !this.confirmDeleteRoundMatch) return;
    const matchId = this.confirmDeleteRoundMatch.id;
    this.confirmDeleteRoundMatch = null;
    try {
      await this.api.deleteMatch(this.selectedCompId, matchId);
      this.toast.success('Mecz usunięty');
      await this.loadTeamsAndMatches();
    } catch {}
  }

  // ---- Matches management ----

  async addMatch() {
    if (!this.selectedCompId || !this.newMatch.homeTeamId || !this.newMatch.awayTeamId) return;
    this.matchError = '';
    this.matchSuccess = '';

    try {
      await this.api.addMatch(this.selectedCompId, {
        homeTeamId: this.newMatch.homeTeamId,
        awayTeamId: this.newMatch.awayTeamId,
        deadline: this.newMatch.deadline || undefined,
        roundId: this.newMatch.roundId || undefined,
      });
      this.toast.success('Mecz dodany');
      this.matchSuccess = 'Mecz dodany!';
      this.newMatch = { homeTeamId: null, awayTeamId: null, deadline: '', roundId: null };
      await this.loadTeamsAndMatches();
      setTimeout(() => { this.matchSuccess = ''; }, 3000);
    } catch (e: any) {
      this.matchError = e?.error?.error || 'Błąd dodawania meczu';
    }
  }

  async deleteMatch() {
    if (!this.selectedCompId || !this.confirmDeleteMatch) return;
    const matchId = this.confirmDeleteMatch.id;
    this.confirmDeleteMatch = null;
    try {
      await this.api.deleteMatch(this.selectedCompId, matchId);
      this.toast.success('Mecz usunięty');
      await this.loadTeamsAndMatches();
    } catch {}
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ---- Results management ----

  async loadResults(compId: number) {
    try {
      this.resultsComp = await this.api.getCompetition(compId);
      this.matchScores = {};
      for (const round of this.resultsComp.rounds) {
        for (const match of round.matches) {
          this.matchScores[match.id] = {
            home: match.homeScore ?? null,
            away: match.awayScore ?? null,
          };
        }
      }
    } catch {
      this.resultsComp = null;
    }
  }

  toggleRound(roundId: number) {
    this.expandedRoundId = this.expandedRoundId === roundId ? null : roundId;
    this.savedRoundId = null;
    this.saveError = '';
  }

  hasPlayedMatches(round: any): boolean {
    return round.matches.some((m: any) => m.isPlayed) && !round.isCompleted;
  }

  async saveResults(compId: number, round: any) {
    const results = round.matches
      .filter((m: any) => this.matchScores[m.id]?.home !== null && this.matchScores[m.id]?.away !== null)
      .map((m: any) => ({
        matchId: m.id,
        homeScore: this.matchScores[m.id].home,
        awayScore: this.matchScores[m.id].away,
      }));

    if (results.length === 0) {
      this.saveError = 'Wpisz wynik przynajmniej jednego meczu';
      this.errorRoundId = round.id;
      return;
    }

    this.savingRoundId = round.id;
    this.savedRoundId = null;
    this.saveError = '';
    this.errorRoundId = null;

    try {
      await this.api.updateRoundResults(compId, round.id, results);
      this.savedRoundId = round.id;
      this.toast.success('Wyniki zapisane i punkty naliczone');
      await this.loadResults(compId);
      this.expandedRoundId = round.id;
      setTimeout(() => { this.savedRoundId = null; }, 5000);
    } catch (e: any) {
      this.saveError = e?.error?.error || 'Błąd zapisu wyników';
      this.errorRoundId = round.id;
    } finally {
      this.savingRoundId = null;
    }
  }
}
