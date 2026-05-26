import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { APP_LOGO_URL } from '../../branding';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink, NgClass],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <img routerLink="/landing" [src]="logoUrl" alt="protyper" class="app-logo-mark mx-auto mb-6 h-14 max-h-[64px] w-auto max-w-[min(260px,88vw)] object-contain" />
          <p class="text-white/35 text-sm mt-1 tracking-wide">Stwórz konto i zacznij typować</p>
        </div>

        <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-3xl p-6 space-y-4">
          <img routerLink="/landing" [src]="logoUrl" alt="" class="app-logo-mark absolute right-[-10px] bottom-[-10px] h-[120px] w-auto max-w-[60%] object-contain object-bottom-right opacity-[0.035] pointer-events-none select-none" />
          <div class="relative z-[1] space-y-4">
            @if (error) {
              <div class="bg-red-500/10 border border-red-500/15 rounded-xl p-3 text-red-400 text-sm">{{ error }}</div>
            }

            <div>
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1.5">Nazwa użytkownika</label>
              <input type="text" [(ngModel)]="username" placeholder="Min. 5 znaków"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 placeholder:text-white/20 transition-all">
              @if (username().length > 0 && username().length < 5) {
                <p class="text-red-400 text-[11px] mt-1.5 flex items-center gap-1">
                  <mat-icon class="text-[12px] w-3 h-3">close</mat-icon>
                  Minimum 5 znaków ({{ username().length }}/5)
                </p>
              }
            </div>

            <div>
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" [(ngModel)]="email" placeholder="twoj&#64;email.pl"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 placeholder:text-white/20 transition-all">
            </div>

            <div>
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1.5">Hasło</label>
              <input type="password" [(ngModel)]="password" placeholder="Silne hasło"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 placeholder:text-white/20 transition-all">

              @if (password().length > 0) {
                <div class="mt-2 space-y-1">
                  @for (rule of passwordRules(); track rule.label) {
                    <div class="flex items-center gap-1.5">
                      <mat-icon class="text-[12px] w-3 h-3" [ngClass]="{'text-emerald-400': rule.ok, 'text-white/20': !rule.ok}">
                        {{ rule.ok ? 'check_circle' : 'radio_button_unchecked' }}
                      </mat-icon>
                      <span class="text-[11px]" [ngClass]="{'text-emerald-400': rule.ok, 'text-white/25': !rule.ok}">{{ rule.label }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            <button (click)="register()" [disabled]="loading || !isFormValid()"
                    class="w-full py-3.5 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-50 text-[#1E1A17] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
              @if (loading) {
                <mat-icon class="animate-spin text-[20px] w-5 h-5">refresh</mat-icon>
              }
              Zarejestruj się
            </button>

            <p class="text-center text-zinc-400 text-sm mt-4">
              Masz konto? <a routerLink="/login" class="text-[#FEF400]/70 font-semibold hover:underline">Zaloguj się</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  readonly logoUrl = APP_LOGO_URL;

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  username = signal('');
  email = signal(this.route.snapshot.queryParamMap.get('email') ?? '');
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
