import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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

    <div class="min-h-screen bg-[#1E1A17] text-white/90 font-sans selection:bg-[#FEF400]/20 relative flex flex-col">
      @if (!isLanding()) {
        <div class="fixed inset-0 z-0 pointer-events-none">
          <img
            src="https://pzpn.pl/public/system/images/articles/13334/18137-zoom.jpg?ts=e1d206b786916dcee5f07cd608834f43"
            alt=""
            referrerpolicy="no-referrer"
            class="w-full h-full object-cover opacity-[0.08]"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-[#1E1A17]/60 via-[#1E1A17]/90 to-[#1E1A17]"></div>
        </div>
      }

      @if (auth.isLoggedIn()) {
        <app-global-header></app-global-header>
      }

      <div class="relative z-10 flex-1" [class.pb-24]="!isLanding()">
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
  private router = inject(Router);
  private url = toSignal(this.router.events.pipe(map(() => this.router.url)), { initialValue: this.router.url });
  isLanding = computed(() => this.url().startsWith('/landing'));
}
