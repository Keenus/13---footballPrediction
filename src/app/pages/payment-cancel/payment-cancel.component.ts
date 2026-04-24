import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div class="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center mb-6">
        <mat-icon class="text-white/50 text-[48px] w-12 h-12">cancel</mat-icon>
      </div>
      <h1 class="text-2xl font-black text-white mb-2 uppercase tracking-tight">Płatność anulowana</h1>
      <p class="text-white/50 mb-8 max-w-sm text-sm">
        Twoja płatność została anulowana. Możesz spróbować ponownie w każdej chwili.
      </p>
      <button (click)="goBack()"
              class="px-8 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold uppercase tracking-wider rounded-xl transition-all">
        Wróć do subskrypcji
      </button>
    </div>
  `
})
export class PaymentCancelComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/subscription']);
  }
}
