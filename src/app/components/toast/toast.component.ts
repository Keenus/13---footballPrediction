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
        <div class="pointer-events-auto w-full backdrop-blur-xl border shadow-lg rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-300"
             [ngClass]="{
               'bg-emerald-500/15 border-emerald-500/30 text-emerald-300': toast.type === 'success',
               'bg-red-500/15 border-red-500/30 text-red-300': toast.type === 'error',
               'bg-blue-500/15 border-blue-500/30 text-blue-300': toast.type === 'info',
               'bg-amber-500/15 border-amber-500/30 text-amber-300': toast.type === 'warning',
               'animate-toast-in': !toast.removing,
               'animate-toast-out': toast.removing
             }">
          <mat-icon class="text-[20px] w-5 h-5 shrink-0 mt-0.5"
                    [ngClass]="{
                      'text-emerald-400': toast.type === 'success',
                      'text-red-400': toast.type === 'error',
                      'text-blue-400': toast.type === 'info',
                      'text-amber-400': toast.type === 'warning'
                    }">
            {{ iconFor(toast.type) }}
          </mat-icon>
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)"
                  class="shrink-0 p-0.5 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
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
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      default:        return 'info';
    }
  }
}
