import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Support" subtitle="Zgłoszenia i pomoc"></app-page-header>

      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <mat-icon class="text-blue-400 text-[32px] w-8 h-8">construction</mat-icon>
        </div>
        <h3 class="text-white font-semibold text-sm mb-2">W budowie</h3>
        <p class="text-zinc-500 text-xs max-w-[240px]">
          Moduł supportu jest w trakcie tworzenia. Wkrótce będziesz mógł zarządzać zgłoszeniami użytkowników.
        </p>
      </div>
    </div>
  `
})
export class SupportComponent {}
