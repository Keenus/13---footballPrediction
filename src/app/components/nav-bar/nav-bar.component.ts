import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-[#1E1A17]/85 backdrop-blur-2xl border-t border-white/[0.06] pb-safe z-50">
      <div class="flex justify-between items-stretch max-w-md mx-auto px-2">
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="!text-[#FEF400]" class="flex flex-col items-center justify-center text-white/25 hover:text-white/40 transition-colors py-2.5 flex-1 min-h-[56px] gap-1">
            <mat-icon class="text-[22px] w-[22px] h-[22px]">admin_panel_settings</mat-icon>
            <span class="text-[9px] font-bold uppercase tracking-wider">Zarządzaj</span>
          </a>
          <a routerLink="/support" routerLinkActive="!text-[#FEF400]" class="flex flex-col items-center justify-center text-white/25 hover:text-white/40 transition-colors py-2.5 flex-1 min-h-[56px] gap-1">
            <mat-icon class="text-[22px] w-[22px] h-[22px]">support_agent</mat-icon>
            <span class="text-[9px] font-bold uppercase tracking-wider">Support</span>
          </a>
        } @else {
          <a routerLink="/dashboard" routerLinkActive="!text-[#FEF400]" class="flex flex-col items-center justify-center text-white/25 hover:text-white/40 transition-colors py-2.5 flex-1 min-h-[56px] gap-1">
            <mat-icon class="text-[22px] w-[22px] h-[22px]">stadium</mat-icon>
            <span class="text-[9px] font-bold uppercase tracking-wider">Start</span>
          </a>
          <a routerLink="/predictions" routerLinkActive="!text-[#FEF400]" class="flex flex-col items-center justify-center text-white/25 hover:text-white/40 transition-colors py-2.5 flex-1 min-h-[56px] gap-1">
            <mat-icon class="text-[22px] w-[22px] h-[22px]">sports_soccer</mat-icon>
            <span class="text-[9px] font-bold uppercase tracking-wider">Typuj</span>
          </a>
          <a routerLink="/ranking" routerLinkActive="!text-[#FEF400]" class="flex flex-col items-center justify-center text-white/25 hover:text-white/40 transition-colors py-2.5 flex-1 min-h-[56px] gap-1">
            <mat-icon class="text-[22px] w-[22px] h-[22px]">military_tech</mat-icon>
            <span class="text-[9px] font-bold uppercase tracking-wider">Ranking</span>
          </a>
          <a routerLink="/history" routerLinkActive="!text-[#FEF400]" class="flex flex-col items-center justify-center text-white/25 hover:text-white/40 transition-colors py-2.5 flex-1 min-h-[56px] gap-1">
            <mat-icon class="text-[22px] w-[22px] h-[22px]">scoreboard</mat-icon>
            <span class="text-[9px] font-bold uppercase tracking-wider">Historia</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class NavBarComponent {
  auth = inject(AuthService);
}
