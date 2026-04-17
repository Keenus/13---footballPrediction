import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { LeagueStateService } from '../../services/league-state.service';
import { ToastService } from '../../services/toast.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-join-league',
  standalone: true,
  imports: [FormsModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Dołącz do ligi" subtitle="Wpisz kod zaproszenia"></app-page-header>

      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        @if (error) {
          <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{{ error }}</div>
        }
        @if (success) {
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-sm">{{ success }}</div>
        }

        <div>
          <label class="block text-zinc-400 text-xs font-medium mb-1.5">Kod zaproszenia</label>
          <input type="text" [(ngModel)]="inviteCode" placeholder="np. Ab3xK9mZ" maxlength="20"
                 class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all tracking-widest text-center text-lg font-mono">
        </div>

        <button (click)="join()" [disabled]="loading || !inviteCode.trim()"
                class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all">
          Dołącz do ligi
        </button>
      </div>
    </div>
  `
})
export class JoinLeagueComponent {
  private api = inject(ApiService);
  private leagueState = inject(LeagueStateService);
  private router = inject(Router);
  private toast = inject(ToastService);

  inviteCode = '';
  error = '';
  success = '';
  loading = false;

  async join() {
    this.error = '';
    this.success = '';
    this.loading = true;
    try {
      const result = await this.api.joinLeague(this.inviteCode.trim());
      this.success = `Dołączyłeś do ligi "${result.name}"!`;
      this.toast.success(`Dołączono do ligi "${result.name}"`);
      await this.leagueState.loadLeagues();
      this.leagueState.setActiveLeague(result.id);
      setTimeout(() => this.router.navigate(['/dashboard']), 1500);
    } catch (e: any) {
      this.error = e?.error?.error || 'Nie udało się dołączyć';
    } finally {
      this.loading = false;
    }
  }
}
