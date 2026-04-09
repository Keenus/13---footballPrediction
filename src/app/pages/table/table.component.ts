import { Component, inject, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [PageHeaderComponent, MatIconModule, RouterLink],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Rozgrywki" subtitle="Tabela formy drużyn"></app-page-header>

      @if (!leagueState.activeLeague()) {
        <div class="text-center text-zinc-400 py-10">
          <mat-icon class="text-4xl mb-2 opacity-50">sports_soccer</mat-icon>
          <p>Nie masz aktywnej ligi.</p>
          <button (click)="router.navigate(['/dashboard'])" class="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">Przejdź do kokpitu</button>
        </div>
      } @else {
        @if (isLimited) {
          <div class="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
            <mat-icon class="text-amber-400 text-[20px]">lock</mat-icon>
            <div>
              <p class="text-xs text-amber-200/80 leading-relaxed">Widzisz tylko top 3. <a routerLink="/subscription" class="text-amber-400 font-semibold underline">Ulepsz plan</a> aby zobaczyć pełną tabelę.</p>
            </div>
          </div>
        }

        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-[10px] text-zinc-400 bg-black/20 uppercase tracking-wider">
                <tr>
                  <th class="px-3 py-4 text-center w-8">#</th>
                  <th class="px-2 py-4">Drużyna</th>
                  <th class="px-2 py-4 text-center" title="Mecze">M</th>
                  <th class="px-2 py-4 text-center" title="Zwycięstwa">Z</th>
                  <th class="px-2 py-4 text-center" title="Remisy">R</th>
                  <th class="px-2 py-4 text-center" title="Porażki">P</th>
                  <th class="px-2 py-4 text-center" title="Bramki">B</th>
                  <th class="px-3 py-4 text-center font-bold text-blue-400">PKT</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                @for (row of table; track row.teamId; let i = $index) {
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-3 py-3 text-center font-medium text-zinc-500">{{ i + 1 }}</td>
                    <td class="px-2 py-3 font-semibold text-white whitespace-nowrap">{{ row.teamName }}</td>
                    <td class="px-2 py-3 text-center text-zinc-400">{{ row.matchesPlayed }}</td>
                    <td class="px-2 py-3 text-center text-zinc-400">{{ row.won }}</td>
                    <td class="px-2 py-3 text-center text-zinc-400">{{ row.drawn }}</td>
                    <td class="px-2 py-3 text-center text-zinc-400">{{ row.lost }}</td>
                    <td class="px-2 py-3 text-center text-zinc-400 text-xs">{{ row.goalsFor }}:{{ row.goalsAgainst }}</td>
                    <td class="px-3 py-3 text-center font-bold text-blue-400">{{ row.points }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class TableComponent implements OnInit {
  leagueState = inject(LeagueStateService);
  private api = inject(ApiService);
  router = inject(Router);

  table: any[] = [];
  isLimited = false;

  private leagueEffect = effect(() => {
    const league = this.leagueState.activeLeague();
    if (league) {
      this.loadTable(league.id);
    }
  });

  async ngOnInit() {
    const league = this.leagueState.activeLeague();
    if (league) await this.loadTable(league.id);
  }

  async loadTable(leagueId: number) {
    try {
      const data = await this.api.getTable(leagueId);
      this.table = data.table;
      this.isLimited = data.isLimited;
    } catch {}
  }
}
