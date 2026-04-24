import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass, MatIconModule],
  template: `
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto w-full backdrop-blur-2xl border shadow-xl rounded-2xl px-4 py-3.5 flex items-start gap-3 transition-all duration-300"
             [ngClass]="{
               'bg-emerald-500/10 border-emerald-500/20 text-emerald-300': toast.type === 'success',
               'bg-red-500/10 border-red-500/20 text-red-300': toast.type === 'error',
               'bg-[#FEF400]/[0.06] border-[#FEF400]/15 text-[#FEF400]/90': toast.type === 'info',
               'bg-amber-500/10 border-amber-500/20 text-amber-300': toast.type === 'warning',
               'animate-toast-in': !toast.removing,
               'animate-toast-out': toast.removing
             }">
          <mat-icon class="text-[20px] w-5 h-5 shrink-0 mt-0.5"
                    [ngClass]="{
                      'text-emerald-400': toast.type === 'success',
                      'text-red-400': toast.type === 'error',
                      'text-[#FEF400]/70': toast.type === 'info',
                      'text-amber-400': toast.type === 'warning'
                    }">
            {{ iconFor(toast.type) }}
          </mat-icon>
          <span class="text-sm font-semibold flex-1">{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)"
                  class="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-50 hover:opacity-100">
            <mat-icon class="text-[16px] w-4 h-4">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'emoji_events';
      case 'error':   return 'local_fire_department';
      case 'warning': return 'flag';
      case 'info':
      default:        return 'sports_soccer';
    }
  }
}
