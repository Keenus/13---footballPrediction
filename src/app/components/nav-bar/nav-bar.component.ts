import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-zinc-950/70 backdrop-blur-2xl border-t border-white/10 pb-safe pt-2 px-2 z-50">
      <div class="flex justify-between items-center max-w-md mx-auto">
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="text-blue-400" class="flex flex-col items-center text-zinc-500 hover:text-blue-300 transition-colors p-2 flex-1">
            <mat-icon class="mb-1">admin_panel_settings</mat-icon>
            <span class="text-[10px] font-medium tracking-wide">Zarządzaj</span>
          </a>
          <a routerLink="/support" routerLinkActive="text-blue-400" class="flex flex-col items-center text-zinc-500 hover:text-blue-300 transition-colors p-2 flex-1">
            <mat-icon class="mb-1">support_agent</mat-icon>
            <span class="text-[10px] font-medium tracking-wide">Support</span>
          </a>
        } @else {
          <a routerLink="/dashboard" routerLinkActive="text-blue-400" class="flex flex-col items-center text-zinc-500 hover:text-blue-300 transition-colors p-2 flex-1">
            <mat-icon class="mb-1">dashboard</mat-icon>
            <span class="text-[10px] font-medium tracking-wide">Start</span>
          </a>
          <a routerLink="/predictions" routerLinkActive="text-blue-400" class="flex flex-col items-center text-zinc-500 hover:text-blue-300 transition-colors p-2 flex-1">
            <mat-icon class="mb-1">sports_soccer</mat-icon>
            <span class="text-[10px] font-medium tracking-wide">Typuj</span>
          </a>
          <a routerLink="/ranking" routerLinkActive="text-blue-400" class="flex flex-col items-center text-zinc-500 hover:text-blue-300 transition-colors p-2 flex-1">
            <mat-icon class="mb-1">leaderboard</mat-icon>
            <span class="text-[10px] font-medium tracking-wide">Ranking</span>
          </a>
          <a routerLink="/history" routerLinkActive="text-blue-400" class="flex flex-col items-center text-zinc-500 hover:text-blue-300 transition-colors p-2 flex-1">
            <mat-icon class="mb-1">history</mat-icon>
            <span class="text-[10px] font-medium tracking-wide">Historia</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class NavBarComponent {
  auth = inject(AuthService);
}
