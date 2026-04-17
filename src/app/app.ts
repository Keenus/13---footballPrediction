import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { GlobalHeaderComponent } from './components/global-header/global-header.component';
import { ToastComponent } from './components/toast/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, GlobalHeaderComponent, ToastComponent],
  template: `
    <app-toast />

    <div class="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 relative flex flex-col">
      <div class="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://pzpn.pl/public/system/images/articles/13334/18137-zoom.jpg?ts=e1d206b786916dcee5f07cd608834f43"
          alt="Football Stadium Background"
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/80 to-zinc-950"></div>
      </div>

      @if (auth.isLoggedIn()) {
        <app-global-header></app-global-header>
      }

      <div class="relative z-10 pb-20 flex-1">
        <router-outlet></router-outlet>
      </div>

      @if (auth.isLoggedIn()) {
        <div class="relative z-20">
          <app-nav-bar></app-nav-bar>
        </div>
      }
    </div>
  `
})
export class App {
  auth = inject(AuthService);
}
