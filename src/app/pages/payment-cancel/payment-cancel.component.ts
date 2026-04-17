import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div class="w-20 h-20 rounded-full bg-zinc-500/20 flex items-center justify-center mb-6">
        <mat-icon class="text-zinc-400 text-[48px] w-12 h-12">cancel</mat-icon>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Płatność anulowana</h1>
      <p class="text-zinc-400 mb-8 max-w-sm">
        Twoja płatność została anulowana. Możesz spróbować ponownie w każdej chwili.
      </p>
      <button (click)="goBack()"
              class="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all">
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
