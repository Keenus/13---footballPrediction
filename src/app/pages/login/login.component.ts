import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <mat-icon class="text-blue-400 text-[32px] w-8 h-8">sports_soccer</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-white">Typer 2026</h1>
          <p class="text-zinc-400 text-sm mt-1">Zaloguj się aby typować</p>
        </div>

        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          @if (error) {
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{{ error }}</div>
          }

          <div>
            <label class="block text-zinc-400 text-xs font-medium mb-1.5">Email</label>
            <input type="email" [(ngModel)]="email" placeholder="twoj@email.pl"
                   class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
          </div>

          <div>
            <label class="block text-zinc-400 text-xs font-medium mb-1.5">Hasło</label>
            <input type="password" [(ngModel)]="password" placeholder="••••••••"
                   class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
          </div>

          <button (click)="login()" [disabled]="loading"
                  class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            @if (loading) {
              <mat-icon class="animate-spin text-[20px] w-5 h-5">refresh</mat-icon>
            }
            Zaloguj się
          </button>

          <p class="text-center text-zinc-400 text-sm mt-4">
            Nie masz konta? <a routerLink="/register" class="text-blue-400 font-medium hover:underline">Zarejestruj się</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  async login() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Błąd logowania';
    } finally {
      this.loading = false;
    }
  }
}
