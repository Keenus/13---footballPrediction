import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [MatIconModule, NgClass, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Subskrypcje" subtitle="Wybierz pakiet dla siebie"></app-page-header>

      <div class="space-y-4">
        @for (plan of plans; track plan.id) {
          <div class="rounded-2xl border p-5 transition-all"
               [ngClass]="{
                 'bg-amber-500/5 border-amber-500/30': plan.name === 'gold',
                 'bg-emerald-500/5 border-emerald-500/20': plan.name === 'standard',
                 'bg-white/5 border-white/10': plan.name === 'light',
                 'ring-2 ring-blue-500': isCurrentPlan(plan.id)
               }">

            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  {{ plan.display_name }}
                  @if (isCurrentPlan(plan.id)) {
                    <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold">Aktywny</span>
                  }
                </h3>
                <div class="text-2xl font-bold mt-1"
                     [ngClass]="{'text-amber-400': plan.name === 'gold', 'text-emerald-400': plan.name === 'standard', 'text-zinc-300': plan.name === 'light'}">
                  @if (plan.price === '0.00') {
                    Darmowy
                  } @else {
                    {{ plan.price }} zł<span class="text-sm text-zinc-500 font-normal">/mies.</span>
                  }
                </div>
              </div>
              <mat-icon class="text-[32px] w-8 h-8"
                        [ngClass]="{'text-amber-400': plan.name === 'gold', 'text-emerald-400': plan.name === 'standard', 'text-zinc-400': plan.name === 'light'}">
                {{ plan.name === 'gold' ? 'workspace_premium' : plan.name === 'standard' ? 'star' : 'eco' }}
              </mat-icon>
            </div>

            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4" [ngClass]="plan.can_create_leagues ? 'text-emerald-400' : 'text-zinc-600'">
                  {{ plan.can_create_leagues ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span [ngClass]="plan.can_create_leagues ? 'text-zinc-300' : 'text-zinc-600'">
                  Tworzenie lig {{ plan.max_created_leagues !== null ? '(max ' + plan.max_created_leagues + ')' : '(bez limitu)' }}
                </span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4 text-emerald-400">check_circle</mat-icon>
                <span class="text-zinc-300">
                  Dołączanie do lig {{ plan.max_joined_leagues !== null ? '(max ' + plan.max_joined_leagues + ')' : '(bez limitu)' }}
                </span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4" [ngClass]="plan.full_statistics ? 'text-emerald-400' : 'text-zinc-600'">
                  {{ plan.full_statistics ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span [ngClass]="plan.full_statistics ? 'text-zinc-300' : 'text-zinc-600'">
                  {{ plan.full_statistics ? 'Pełne statystyki' : 'Ograniczone statystyki (top 3 + Twoje)' }}
                </span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4" [ngClass]="plan.custom_scoring ? 'text-emerald-400' : 'text-zinc-600'">
                  {{ plan.custom_scoring ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span [ngClass]="plan.custom_scoring ? 'text-zinc-300' : 'text-zinc-600'">
                  Customowe zasady punktacji
                </span>
              </li>
            </ul>

            @if (!isCurrentPlan(plan.id)) {
              <div class="mt-4 py-2 text-center text-xs text-zinc-500 bg-white/5 rounded-xl border border-white/5">
                Skontaktuj się z administratorem aby zmienić plan
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class SubscriptionComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  plans: any[] = [];

  async ngOnInit() {
    try {
      this.plans = await this.api.getSubscriptionPlans();
    } catch {}
  }

  isCurrentPlan(planId: number): boolean {
    return this.auth.currentUser()?.subscriptionPlan?.id === planId;
  }
}
