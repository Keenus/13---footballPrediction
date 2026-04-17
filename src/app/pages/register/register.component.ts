import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink, NgClass],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <mat-icon class="text-blue-400 text-[32px] w-8 h-8">sports_soccer</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-white">Typer 2026</h1>
          <p class="text-zinc-400 text-sm mt-1">Stwórz konto i zacznij typować</p>
        </div>

        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          @if (error) {
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{{ error }}</div>
          }

          <div>
            <label class="block text-zinc-400 text-xs font-medium mb-1.5">Nazwa użytkownika</label>
            <input type="text" [(ngModel)]="username" placeholder="Min. 5 znaków"
                   class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            @if (username().length > 0 && username().length < 5) {
              <p class="text-red-400 text-[11px] mt-1.5 flex items-center gap-1">
                <mat-icon class="text-[12px] w-3 h-3">close</mat-icon>
                Minimum 5 znaków ({{ username().length }}/5)
              </p>
            }
          </div>

          <div>
            <label class="block text-zinc-400 text-xs font-medium mb-1.5">Email</label>
            <input type="email" [(ngModel)]="email" placeholder="twoj&#64;email.pl"
                   class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
          </div>

          <div>
            <label class="block text-zinc-400 text-xs font-medium mb-1.5">Hasło</label>
            <input type="password" [(ngModel)]="password" placeholder="Silne hasło"
                   class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">

            @if (password().length > 0) {
              <div class="mt-2 space-y-1">
                @for (rule of passwordRules(); track rule.label) {
                  <div class="flex items-center gap-1.5">
                    <mat-icon class="text-[12px] w-3 h-3" [ngClass]="{'text-emerald-400': rule.ok, 'text-zinc-600': !rule.ok}">
                      {{ rule.ok ? 'check_circle' : 'radio_button_unchecked' }}
                    </mat-icon>
                    <span class="text-[11px]" [ngClass]="{'text-emerald-400': rule.ok, 'text-zinc-500': !rule.ok}">{{ rule.label }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <button (click)="register()" [disabled]="loading || !isFormValid()"
                  class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            @if (loading) {
              <mat-icon class="animate-spin text-[20px] w-5 h-5">refresh</mat-icon>
            }
            Zarejestruj się
          </button>

          <p class="text-center text-zinc-400 text-sm mt-4">
            Masz konto? <a routerLink="/login" class="text-blue-400 font-medium hover:underline">Zaloguj się</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  username = signal('');
  email = signal('');
  password = signal('');
  error = '';
  loading = false;

  passwordRules = computed(() => {
    const p = this.password();
    return [
      { label: 'Min. 8 znaków', ok: p.length >= 8 },
      { label: 'Wielka litera (A-Z)', ok: /[A-Z]/.test(p) },
      { label: 'Mała litera (a-z)', ok: /[a-z]/.test(p) },
      { label: 'Cyfra (0-9)', ok: /[0-9]/.test(p) },
      { label: 'Znak specjalny (!@#$%...)', ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
    ];
  });

  isPasswordValid = computed(() => this.passwordRules().every(r => r.ok));
  isFormValid = computed(() => this.username().length >= 5 && this.email().length > 0 && this.isPasswordValid());

  async register() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.register(this.email(), this.password(), this.username());
      this.toast.success('Konto utworzone pomyślnie');
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Błąd rejestracji';
    } finally {
      this.loading = false;
    }
  }
}
