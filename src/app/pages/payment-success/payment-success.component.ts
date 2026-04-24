import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div class="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mb-6">
        <mat-icon class="text-emerald-400 text-[48px] w-12 h-12">check_circle</mat-icon>
      </div>
      <h1 class="text-2xl font-black text-white mb-2 uppercase tracking-tight">Płatność zakończona!</h1>
      <p class="text-white/50 mb-8 max-w-sm text-sm">
        Twoja subskrypcja została aktywowana. Dziękujemy za zakup!
      </p>
      <button (click)="goToDashboard()"
              class="px-8 py-3 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] font-bold uppercase tracking-wider rounded-xl transition-all">
        Przejdź do aplikacji
      </button>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  async ngOnInit() {
    await this.auth.init();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
