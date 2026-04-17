import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

type AdminTab = 'competitions' | 'teams' | 'matches' | 'results';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, NgClass, FormsModule, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Panel Admina" subtitle="Zarządzaj rozgrywkami, drużynami i meczami"></app-page-header>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab = tab.id; onTabChange()"
                  class="flex-1 py-2.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex flex-col items-center gap-1"
                  [ngClass]="{'bg-blue-600 text-white shadow-lg': activeTab === tab.id, 'text-zinc-400 hover:text-white hover:bg-white/5': activeTab !== tab.id}">
            <mat-icon class="text-[16px] w-4 h-4">{{ tab.icon }}</mat-icon>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- COMPETITIONS TAB -->
      @if (activeTab === 'competitions') {
        <div class="space-y-4">
          <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 class="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <mat-icon class="text-blue-400 text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
              Nowe rozgrywki
            </h3>
            <div class="space-y-3">
              <input type="text" [(ngModel)]="newComp.name" placeholder="Nazwa rozgrywek"
                     class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600">
              <div class="flex gap-2">
                <select [(ngModel)]="newComp.type"
                        class="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                  <option value="tournament">Turniej</option>
                  <option value="league">Liga</option>
                  <option value="custom">Własne</option>
                </select>
                <input type="text" [(ngModel)]="newComp.season" placeholder="Sezon np. 2025/26"
                       class="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-600">
              </div>
              <button (click)="createCompetition()" [disabled]="!newComp.name.trim()"
                      class="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Utwórz
              </button>
            </div>
          </div>

          @if (loadingComps) {
            <div class="text-center text-zinc-400 py-6">
              <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
              <p class="text-xs">Ładowanie...</p>
            </div>
          }

          @for (comp of competitions; track comp.id) {
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              @if (editingCompId === comp.id) {
                <div class="space-y-3">
                  <input type="text" [(ngModel)]="editComp.name"
                         class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                  <div class="flex gap-2">
                    <select [(ngModel)]="editComp.type"
                            class="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="tournament">Turniej</option>
                      <option value="league">Liga</option>
                      <option value="custom">Własne</option>
                    </select>
                    <input type="text" [(ngModel)]="editComp.season" placeholder="Sezon"
                           class="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-600">
                  </div>
                  <label class="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer">
                    <input type="checkbox" [(ngModel)]="editComp.isFinished" class="accent-blue-500">
                    Zakończone
                  </label>
                  <div class="flex gap-2">
                    <button (click)="saveCompetition(comp.id)" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all">Zapisz</button>
                    <button (click)="editingCompId = null" class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-xl transition-all border border-white/5">Anuluj</button>
                  </div>
                </div>
              } @else {
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-semibold text-white text-sm">{{ comp.name }}</div>
                    <div class="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                      <span class="px-1.5 py-0.5 bg-white/5 rounded">{{ comp.type === 'tournament' ? 'Turniej' : comp.type === 'league' ? 'Liga' : 'Własne' }}</span>
                      @if (comp.season) { <span>{{ comp.season }}</span> }
                      <span>{{ comp.teams?.length || 0 }} drużyn</span>
                      @if (comp.isFinished) {
                        <span class="text-emerald-400 font-bold">Zakończone</span>
                      }
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <button (click)="startEditComp(comp)" class="p-2 text-zinc-500 hover:text-blue-400 transition-colors rounded-xl hover:bg-white/5">
                      <mat-icon class="text-[16px] w-4 h-4">edit</mat-icon>
                    </button>
                    <button (click)="confirmDeleteComp = comp" class="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5">
                      <mat-icon class="text-[16px] w-4 h-4">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          @if (!loadingComps && competitions.length === 0) {
            <div class="text-center py-8 text-zinc-500">
              <mat-icon class="text-4xl mb-2 opacity-30">emoji_events</mat-icon>
              <p class="text-xs">Brak rozgrywek. Utwórz pierwszą powyżej.</p>
            </div>
          }
        </div>
      }

      <!-- TEAMS TAB -->
      @if (activeTab === 'teams') {
        <div class="space-y-4">
          <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <label class="block text-zinc-400 text-xs font-medium mb-2">Wybierz rozgrywki</label>
            <select [(ngModel)]="selectedCompId" (ngModelChange)="onCompSelected()"
                    class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
              <option [ngValue]="null">-- Wybierz --</option>
              @for (comp of competitions; track comp.id) {
                <option [ngValue]="comp.id">{{ comp.name }} {{ comp.season ? '(' + comp.season + ')' : '' }}</option>
              }
            </select>
          </div>

          @if (selectedCompId) {
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 class="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <mat-icon class="text-emerald-400 text-[18px] w-[18px] h-[18px]">group_add</mat-icon>
                Dodaj drużyny
              </h3>
              <div class="space-y-3">
                <textarea [(ngModel)]="newTeamsText" placeholder="Wpisz nazwy drużyn, każda w nowej linii"
                          rows="4"
                          class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-600 resize-none"></textarea>
                <button (click)="addTeams()" [disabled]="!newTeamsText.trim()"
                        class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Dodaj drużyny
                </button>
              </div>
            </div>

            @if (loadingTeams) {
              <div class="text-center text-zinc-400 py-6">
                <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
              </div>
            }

            <div class="space-y-2">
              @for (team of selectedCompTeams; track team.id; let i = $index) {
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span class="text-zinc-600 text-xs font-mono w-5 text-right">{{ i + 1 }}</span>
                  @if (editingTeamId === team.id) {
                    <input type="text" [(ngModel)]="editTeamName" (keyup.enter)="saveTeam(team.id)"
                           class="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                    <button (click)="saveTeam(team.id)" class="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                      <mat-icon class="text-[16px] w-4 h-4">check</mat-icon>
                    </button>
                    <button (click)="editingTeamId = null" class="p-1.5 text-zinc-500 hover:bg-white/5 rounded-lg transition-colors">
                      <mat-icon class="text-[16px] w-4 h-4">close</mat-icon>
                    </button>
                  } @else {
                    <span class="flex-1 text-white text-sm font-medium">{{ team.name }}</span>
                    <button (click)="editingTeamId = team.id; editTeamName = team.name" class="p-1.5 text-zinc-500 hover:text-blue-400 rounded-lg transition-colors hover:bg-white/5">
                      <mat-icon class="text-[16px] w-4 h-4">edit</mat-icon>
                    </button>
                    <button (click)="confirmDeleteTeam = team" class="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors hover:bg-white/5">
                      <mat-icon class="text-[16px] w-4 h-4">delete</mat-icon>
                    </button>
                  }
                </div>
              }
            </div>

            @if (!loadingTeams && selectedCompTeams.length === 0) {
              <div class="text-center py-8 text-zinc-500">
                <mat-icon class="text-4xl mb-2 opacity-30">groups</mat-icon>
                <p class="text-xs">Brak drużyn. Dodaj je powyżej.</p>
              </div>
            }
          } @else {
            <div class="text-center py-10 text-zinc-500">
              <mat-icon class="text-4xl mb-2 opacity-30">arrow_upward</mat-icon>
              <p class="text-xs">Wybierz rozgrywki, aby zarządzać drużynami</p>
            </div>
          }
        </div>
      }

      <!-- MATCHES TAB -->
      @if (activeTab === 'matches') {
        <div class="space-y-4">
          <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <label class="block text-zinc-400 text-xs font-medium mb-2">Wybierz rozgrywki</label>
            <select [(ngModel)]="selectedCompId" (ngModelChange)="onCompSelected()"
                    class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
              <option [ngValue]="null">-- Wybierz --</option>
              @for (comp of competitions; track comp.id) {
                <option [ngValue]="comp.id">{{ comp.name }} {{ comp.season ? '(' + comp.season + ')' : '' }}</option>
              }
            </select>
          </div>

          @if (selectedCompId && selectedCompTeams.length >= 2) {
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 class="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <mat-icon class="text-amber-400 text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
                Nowy mecz
              </h3>
              <div class="space-y-3">
                <div class="flex gap-2 items-center">
                  <select [(ngModel)]="newMatch.homeTeamId"
                          class="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                    <option [ngValue]="null">Gospodarz</option>
                    @for (team of selectedCompTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                  <span class="text-zinc-500 font-bold text-xs">vs</span>
                  <select [(ngModel)]="newMatch.awayTeamId"
                          class="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                    <option [ngValue]="null">Gość</option>
                    @for (team of selectedCompTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-zinc-400 text-[10px] font-medium mb-1">Deadline (opcjonalnie)</label>
                  <input type="datetime-local" [(ngModel)]="newMatch.deadline"
                         class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                </div>
                <button (click)="addMatch()" [disabled]="!newMatch.homeTeamId || !newMatch.awayTeamId || newMatch.homeTeamId === newMatch.awayTeamId"
                        class="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Dodaj mecz
                </button>
              </div>

              @if (matchError) {
                <div class="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs text-center">{{ matchError }}</div>
              }
              @if (matchSuccess) {
                <div class="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs text-center">{{ matchSuccess }}</div>
              }
            </div>

            @if (loadingMatches) {
              <div class="text-center text-zinc-400 py-6">
                <mat-icon class="text-3xl mb-1 opacity-50 animate-spin">refresh</mat-icon>
              </div>
            }

            @if (selectedCompMatches.length > 0) {
              <div class="space-y-2">
                <h3 class="text-zinc-100 font-semibold text-xs uppercase tracking-wider">Mecze ({{ selectedCompMatches.length }})</h3>
                @for (match of selectedCompMatches; track match.id) {
                  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3"
                       [ngClass]="{'border-emerald-500/20 bg-emerald-500/5': match.isPlayed}">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 text-right">
                        <span class="text-white text-xs font-medium">{{ match.homeTeam.name }}</span>
                      </div>
                      @if (match.isPlayed) {
                        <div class="px-2 py-1 bg-emerald-500/20 rounded-lg">
                          <span class="text-emerald-400 text-xs font-bold">{{ match.homeScore }} : {{ match.awayScore }}</span>
                        </div>
                      } @else {
                        <div class="px-2 py-1 bg-white/5 rounded-lg">
                          <span class="text-zinc-500 text-xs font-bold">vs</span>
                        </div>
                      }
                      <div class="flex-1">
                        <span class="text-white text-xs font-medium">{{ match.awayTeam.name }}</span>
                      </div>
                      <button (click)="confirmDeleteMatch = match" class="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors hover:bg-white/5 shrink-0">
                        <mat-icon class="text-[14px] w-3.5 h-3.5">delete</mat-icon>
                      </button>
                    </div>
                    @if (match.deadline) {
                      <div class="text-center mt-1.5">
                        <span class="text-zinc-500 text-[10px]">Deadline: {{ formatDate(match.deadline) }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            } @else if (!loadingMatches) {
              <div class="text-center py-8 text-zinc-500">
                <mat-icon class="text-4xl mb-2 opacity-30">sports_soccer</mat-icon>
                <p class="text-xs">Brak meczów. Dodaj pierwszy powyżej.</p>
              </div>
            }
          } @else if (selectedCompId && selectedCompTeams.length < 2) {
            <div class="text-center py-10 text-zinc-500">
              <mat-icon class="text-4xl mb-2 opacity-30">warning</mat-icon>
              <p class="text-xs">Najpierw dodaj min. 2 drużyny w zakładce Drużyny</p>
            </div>
          } @else {
            <div class="text-center py-10 text-zinc-500">
              <mat-icon class="text-4xl mb-2 opacity-30">arrow_upward</mat-icon>
              <p class="text-xs">Wybierz rozgrywki, aby zarządzać meczami</p>
            </div>
          }
        </div>
      }

      <!-- RESULTS TAB -->
      @if (activeTab === 'results') {
        @if (loadingComps) {
          <div class="text-center text-zinc-400 py-10">
            <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
            <p class="text-sm">Ładowanie rozgrywek...</p>
          </div>
        } @else {
          @for (comp of competitions; track comp.id) {
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <mat-icon class="text-blue-400 text-[20px] w-5 h-5">emoji_events</mat-icon>
                <h2 class="text-white font-bold text-sm">{{ comp.name }}</h2>
                <span class="text-zinc-500 text-[10px] ml-auto">{{ comp.season }}</span>
              </div>

              @if (resultsComp && resultsComp.id === comp.id) {
                <div class="space-y-4">
                  @for (round of resultsComp.rounds; track round.id) {
                    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                      <button (click)="toggleRound(round.id)" class="w-full px-4 py-3 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                          <h4 class="text-white text-xs font-semibold">{{ round.name || 'Runda ' + round.number }}</h4>
                          @if (round.isCompleted) {
                            <span class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">OK</span>
                          } @else if (hasPlayedMatches(round)) {
                            <span class="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">W trakcie</span>
                          }
                        </div>
                        <mat-icon class="text-zinc-500 text-[18px] w-[18px] h-[18px] transition-transform"
                                  [ngClass]="{'rotate-180': expandedRoundId === round.id}">expand_more</mat-icon>
                      </button>

                      @if (expandedRoundId === round.id) {
                        <div class="border-t border-white/10 p-4">
                          @if (round.matches.length === 0) {
                            <div class="text-zinc-500 text-xs text-center py-4">
                              <mat-icon class="text-2xl mb-1 opacity-30">help_outline</mat-icon>
                              <p>Brak meczów</p>
                            </div>
                          }

                          <div class="space-y-3">
                            @for (match of round.matches; track match.id) {
                              <div class="rounded-xl p-3 border transition-all"
                                   [ngClass]="{'bg-emerald-500/5 border-emerald-500/20': match.isPlayed, 'bg-black/20 border-white/5': !match.isPlayed}">
                                <div class="flex items-center gap-2">
                                  <span class="text-white text-xs font-medium flex-1 text-right truncate">{{ match.homeTeam.name }}</span>
                                  <div class="flex items-center gap-1 shrink-0">
                                    <input type="number" min="0" [(ngModel)]="matchScores[match.id].home" placeholder="-"
                                           class="w-10 h-9 bg-black/40 border border-white/15 rounded-lg text-center text-sm font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                                    <span class="text-zinc-500 text-xs font-bold">:</span>
                                    <input type="number" min="0" [(ngModel)]="matchScores[match.id].away" placeholder="-"
                                           class="w-10 h-9 bg-black/40 border border-white/15 rounded-lg text-center text-sm font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                                  </div>
                                  <span class="text-white text-xs font-medium flex-1 truncate">{{ match.awayTeam.name }}</span>
                                </div>
                                @if (match.isPlayed) {
                                  <div class="flex items-center justify-center gap-1 mt-2">
                                    <mat-icon class="text-emerald-400 text-[12px] w-3 h-3">check_circle</mat-icon>
                                    <span class="text-emerald-400 text-[10px] font-semibold">Zapisano {{ match.homeScore }}:{{ match.awayScore }}</span>
                                  </div>
                                }
                              </div>
                            }
                          </div>

                          @if (round.matches.length > 0) {
                            <button (click)="saveResults(comp.id, round)" [disabled]="savingRoundId === round.id"
                                    class="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
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
                            <div class="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs text-center font-medium flex items-center justify-center gap-2">
                              <mat-icon class="text-[16px] w-4 h-4">done_all</mat-icon>
                              Punkty naliczone we wszystkich ligach!
                            </div>
                          }

                          @if (saveError && errorRoundId === round.id) {
                            <div class="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs text-center">
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
                        class="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-400 text-xs font-medium transition-all flex items-center justify-center gap-2">
                  <mat-icon class="text-[16px] w-4 h-4">visibility</mat-icon>
                  Pokaż mecze i wpisz wyniki
                </button>
              }
            </div>
          }

          @if (competitions.length === 0) {
            <div class="text-center py-10 text-zinc-500">
              <mat-icon class="text-4xl mb-2 opacity-30">sports_soccer</mat-icon>
              <p class="text-xs">Brak rozgrywek</p>
            </div>
          }
        }
      }

      <!-- Delete competition modal -->
      @if (confirmDeleteComp) {
        <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-zinc-900/90 backdrop-blur-2xl p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-2">Usuń rozgrywki</h3>
            <p class="text-zinc-400 text-sm mb-1">Czy na pewno chcesz usunąć <span class="text-white font-medium">{{ confirmDeleteComp.name }}</span>?</p>
            <p class="text-red-400 text-xs mb-6">Spowoduje to usunięcie wszystkich drużyn, meczów i typowań.</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteComp = null" class="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">Anuluj</button>
              <button (click)="deleteCompetition()" class="flex-1 py-3 px-4 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete team modal -->
      @if (confirmDeleteTeam) {
        <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-zinc-900/90 backdrop-blur-2xl p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-2">Usuń drużynę</h3>
            <p class="text-zinc-400 text-sm mb-1">Czy na pewno chcesz usunąć <span class="text-white font-medium">{{ confirmDeleteTeam.name }}</span>?</p>
            <p class="text-red-400 text-xs mb-6">Usunięte zostaną też mecze tej drużyny.</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteTeam = null" class="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">Anuluj</button>
              <button (click)="deleteTeam()" class="flex-1 py-3 px-4 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete match modal -->
      @if (confirmDeleteMatch) {
        <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-zinc-900/90 backdrop-blur-2xl p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-2">Usuń mecz</h3>
            <p class="text-zinc-400 text-sm mb-6">{{ confirmDeleteMatch.homeTeam.name }} vs {{ confirmDeleteMatch.awayTeam.name }}</p>
            <div class="flex gap-3">
              <button (click)="confirmDeleteMatch = null" class="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">Anuluj</button>
              <button (click)="deleteMatch()" class="flex-1 py-3 px-4 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all">Usuń</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);

  tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'competitions', label: 'Rozgrywki', icon: 'emoji_events' },
    { id: 'teams', label: 'Drużyny', icon: 'groups' },
    { id: 'matches', label: 'Mecze', icon: 'sports_soccer' },
    { id: 'results', label: 'Wyniki', icon: 'scoreboard' },
  ];

  activeTab: AdminTab = 'competitions';
  competitions: any[] = [];
  loadingComps = true;

  // Competitions
  newComp = { name: '', type: 'tournament', season: '' };
  editingCompId: number | null = null;
  editComp = { name: '', type: 'tournament', season: '', isFinished: false };
  confirmDeleteComp: any = null;

  // Teams
  selectedCompId: number | null = null;
  selectedCompTeams: any[] = [];
  newTeamsText = '';
  editingTeamId: number | null = null;
  editTeamName = '';
  confirmDeleteTeam: any = null;
  loadingTeams = false;

  // Matches
  selectedCompMatches: any[] = [];
  newMatch = { homeTeamId: null as number | null, awayTeamId: null as number | null, deadline: '' };
  confirmDeleteMatch: any = null;
  loadingMatches = false;
  matchError = '';
  matchSuccess = '';

  // Results
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
    } catch {} finally {
      this.loadingComps = false;
    }
  }

  onTabChange() {
    if (this.activeTab === 'teams' || this.activeTab === 'matches') {
      if (this.selectedCompId) {
        this.onCompSelected();
      }
    }
  }

  // --- Competitions ---

  async createCompetition() {
    if (!this.newComp.name.trim()) return;
    try {
      await this.api.createCompetition({
        name: this.newComp.name.trim(),
        type: this.newComp.type,
        season: this.newComp.season.trim() || undefined,
      });
      this.newComp = { name: '', type: 'tournament', season: '' };
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
      await this.loadCompetitions();
    } catch {}
  }

  async deleteCompetition() {
    if (!this.confirmDeleteComp) return;
    try {
      await this.api.deleteCompetition(this.confirmDeleteComp.id);
      this.confirmDeleteComp = null;
      if (this.selectedCompId === this.confirmDeleteComp?.id) {
        this.selectedCompId = null;
        this.selectedCompTeams = [];
        this.selectedCompMatches = [];
      }
      await this.loadCompetitions();
    } catch {}
    this.confirmDeleteComp = null;
  }

  // --- Teams ---

  async onCompSelected() {
    if (!this.selectedCompId) {
      this.selectedCompTeams = [];
      this.selectedCompMatches = [];
      return;
    }
    await this.loadTeamsAndMatches();
  }

  async loadTeamsAndMatches() {
    if (!this.selectedCompId) return;
    this.loadingTeams = true;
    this.loadingMatches = true;
    try {
      const comp = await this.api.getCompetition(this.selectedCompId);
      this.selectedCompTeams = comp.teams || [];

      const matches = await this.api.getMatches(this.selectedCompId);
      this.selectedCompMatches = matches;
    } catch {
      this.selectedCompTeams = [];
      this.selectedCompMatches = [];
    } finally {
      this.loadingTeams = false;
      this.loadingMatches = false;
    }
  }

  async addTeams() {
    if (!this.selectedCompId || !this.newTeamsText.trim()) return;
    const names = this.newTeamsText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) return;

    try {
      await this.api.addCompetitionTeams(this.selectedCompId, names);
      this.newTeamsText = '';
      await this.loadTeamsAndMatches();
      await this.loadCompetitions();
    } catch {}
  }

  async saveTeam(teamId: number) {
    if (!this.selectedCompId || !this.editTeamName.trim()) return;
    try {
      await this.api.updateTeam(this.selectedCompId, teamId, this.editTeamName.trim());
      this.editingTeamId = null;
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
      await this.loadTeamsAndMatches();
      await this.loadCompetitions();
    } catch {}
  }

  // --- Matches ---

  async addMatch() {
    if (!this.selectedCompId || !this.newMatch.homeTeamId || !this.newMatch.awayTeamId) return;
    this.matchError = '';
    this.matchSuccess = '';

    try {
      await this.api.addMatch(this.selectedCompId, {
        homeTeamId: this.newMatch.homeTeamId,
        awayTeamId: this.newMatch.awayTeamId,
        deadline: this.newMatch.deadline || undefined,
      });
      this.matchSuccess = 'Mecz dodany!';
      this.newMatch = { homeTeamId: null, awayTeamId: null, deadline: '' };
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
      await this.loadTeamsAndMatches();
    } catch {}
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // --- Results ---

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
    } catch {}
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
