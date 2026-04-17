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
      <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
        <mat-icon class="text-emerald-400 text-[48px] w-12 h-12">check_circle</mat-icon>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Płatność zakończona!</h1>
      <p class="text-zinc-400 mb-8 max-w-sm">
        Twoja subskrypcja została aktywowana. Dziękujemy za zakup!
      </p>
      <button (click)="goToDashboard()"
              class="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all">
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
