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

      <div class="bg-[#262220] border border-white/[0.06] rounded-2xl">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-[#FEF400]/[0.06] border border-[#FEF400]/10 flex items-center justify-center mb-4">
            <mat-icon class="text-[#FEF400] text-[32px] w-8 h-8">construction</mat-icon>
          </div>
          <h3 class="text-white font-black uppercase tracking-tight text-sm mb-2">W budowie</h3>
          <p class="text-white/35 text-xs max-w-[240px]">
            Moduł supportu jest w trakcie tworzenia. Wkrótce będziesz mógł zarządzać zgłoszeniami użytkowników.
          </p>
        </div>
      </div>
    </div>
  `
})
export class SupportComponent {}
