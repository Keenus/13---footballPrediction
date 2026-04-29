import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { APP_LOGO_URL } from '../../branding';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <img [src]="logoUrl" alt="protyper" class="mx-auto mb-6 h-14 max-h-[64px] w-auto max-w-[min(260px,88vw)] object-contain" />
          <p class="text-white/35 text-sm mt-1 tracking-wide">Zaloguj się aby typować</p>
        </div>

        <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-3xl p-6 space-y-4">
          <img [src]="logoUrl" alt="" class="absolute right-[-10px] bottom-[-10px] h-[120px] w-auto max-w-[60%] object-contain object-bottom-right opacity-[0.035] pointer-events-none select-none" />
          <div class="relative z-[1] space-y-4">
            @if (error) {
              <div class="bg-red-500/10 border border-red-500/15 rounded-xl p-3 text-red-400 text-sm">{{ error }}</div>
            }

            <div>
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" [(ngModel)]="email" placeholder="twoj@email.pl"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 placeholder:text-white/20 transition-all">
            </div>

            <div>
              <label class="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1.5">Hasło</label>
              <input type="password" [(ngModel)]="password" placeholder="••••••••"
                     class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 focus:ring-2 focus:ring-[#FEF400]/10 placeholder:text-white/20 transition-all">
            </div>

            <button (click)="login()" [disabled]="loading"
                    class="w-full py-3.5 bg-[#FEF400] hover:bg-[#e5dc00] disabled:opacity-50 text-[#1E1A17] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
              @if (loading) {
                <mat-icon class="animate-spin text-[20px] w-5 h-5">refresh</mat-icon>
              }
              Zaloguj się
            </button>

            <p class="text-center text-zinc-400 text-sm mt-4">
              Nie masz konta? <a routerLink="/register" class="text-[#FEF400]/70 font-semibold hover:underline">Zarejestruj się</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  readonly logoUrl = APP_LOGO_URL;

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  error = '';
  loading = false;

  async login() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.login(this.email, this.password);
      this.toast.success('Zalogowano pomyślnie');
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Błąd logowania';
    } finally {
      this.loading = false;
    }
  }
}
