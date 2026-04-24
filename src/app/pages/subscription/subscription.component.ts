import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [MatIconModule, NgClass, UpperCasePipe, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Subskrypcje" subtitle="Wybierz pakiet dla siebie"></app-page-header>

      <div class="space-y-4">
        @for (plan of plans; track plan.id) {
          <div class="relative overflow-hidden rounded-2xl border p-5 transition-all"
               [ngClass]="{
                 'bg-[#262220] border-amber-500/20': plan.name === 'gold',
                 'bg-[#262220] border-emerald-500/20': plan.name === 'standard',
                 'bg-[#262220] border-white/[0.06]': plan.name === 'light',
                 'ring-2 ring-[#FEF400]/40': isCurrentPlan(plan.id)
               }">

            <mat-icon class="absolute right-[-5px] bottom-[-5px] text-[80px] w-[80px] h-[80px] opacity-[0.05] pointer-events-none text-white">
              {{ plan.name === 'gold' ? 'workspace_premium' : plan.name === 'standard' ? 'star' : 'eco' }}
            </mat-icon>

            <div class="relative z-[1]">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    {{ plan.display_name }}
                    @if (isCurrentPlan(plan.id)) {
                      <span class="px-2 py-0.5 rounded-lg bg-[#FEF400]/[0.08] text-[#FEF400]/70 text-[10px] uppercase font-bold">Aktywny</span>
                    }
                  </h3>
                  <div class="text-2xl font-bold mt-1"
                       [ngClass]="{'text-amber-400': plan.name === 'gold', 'text-emerald-400': plan.name === 'standard', 'text-zinc-300': plan.name === 'light'}">
                    @if (plan.price === '0.00') {
                      Darmowy
                    } @else {
                      {{ plan.price }} zł<span class="text-sm text-white/35 font-normal">/mies.</span>
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
                  <mat-icon class="text-[16px] w-4 h-4" [ngClass]="plan.can_create_leagues ? 'text-emerald-400' : 'text-white/25'">
                    {{ plan.can_create_leagues ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <span [ngClass]="plan.can_create_leagues ? 'text-white/60' : 'text-white/25'">
                    Tworzenie typlig {{ plan.max_created_leagues !== null ? '(max ' + plan.max_created_leagues + ')' : '(bez limitu)' }}
                  </span>
                </li>
                <li class="flex items-center gap-2">
                  <mat-icon class="text-[16px] w-4 h-4 text-emerald-400">check_circle</mat-icon>
                  <span class="text-white/60">
                    Dołączanie do typlig {{ plan.max_joined_leagues !== null ? '(max ' + plan.max_joined_leagues + ')' : '(bez limitu)' }}
                  </span>
                </li>
                <li class="flex items-center gap-2">
                  <mat-icon class="text-[16px] w-4 h-4" [ngClass]="plan.full_statistics ? 'text-emerald-400' : 'text-white/25'">
                    {{ plan.full_statistics ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <span [ngClass]="plan.full_statistics ? 'text-white/60' : 'text-white/25'">
                    {{ plan.full_statistics ? 'Pełne statystyki' : 'Ograniczone statystyki (top 3 + Twoje)' }}
                  </span>
                </li>
                <li class="flex items-center gap-2">
                  <mat-icon class="text-[16px] w-4 h-4" [ngClass]="plan.custom_scoring ? 'text-emerald-400' : 'text-white/25'">
                    {{ plan.custom_scoring ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <span [ngClass]="plan.custom_scoring ? 'text-white/60' : 'text-white/25'">
                    Customowe zasady punktacji
                  </span>
                </li>
              </ul>

              @if (!isCurrentPlan(plan.id) && plan.name !== 'light') {
                <button (click)="buyPlan(plan)"
                        class="mt-4 w-full py-2.5 rounded-xl uppercase tracking-wider font-bold text-sm transition-all"
                        [ngClass]="{
                          'bg-amber-500 hover:bg-amber-400 text-black': plan.name === 'gold',
                          'bg-emerald-500 hover:bg-emerald-400 text-black': plan.name === 'standard'
                        }"
                        [disabled]="processingPlanId === plan.id">
                  @if (processingPlanId === plan.id) {
                    <span class="flex items-center justify-center gap-2">
                      <mat-icon class="animate-spin text-[18px] w-[18px] h-[18px]">autorenew</mat-icon>
                      Przekierowuję...
                    </span>
                  } @else {
                    @if (hasActiveSubscription()) {
                      Zmień na {{ plan.display_name }}
                    } @else {
                      Kup {{ plan.display_name }} — {{ plan.price }} zł/mies.
                    }
                  }
                </button>
              }

              @if (isCurrentPlan(plan.id) && plan.name === 'light') {
                <div class="mt-4 py-2 text-center text-xs text-white/35 bg-white/[0.06] rounded-xl border border-white/[0.06]">
                  Twój aktualny pakiet
                </div>
              }

              @if (isCurrentPlan(plan.id) && plan.name !== 'light' && stripeConfigured) {
                <button (click)="manageSubscription()"
                        class="mt-4 w-full py-2.5 rounded-xl uppercase tracking-wider font-bold text-sm bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all">
                  Zarządzaj subskrypcją
                </button>
              }
            </div>
          </div>
        }
      </div>

      @if (!stripeConfigured && plans.length > 0) {
        <div class="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
          <div class="flex items-center gap-2 mb-1">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">warning</mat-icon>
            <span class="font-bold">Płatności niedostępne</span>
          </div>
          <p class="text-yellow-300/70">System płatności Stripe nie jest jeszcze skonfigurowany. Skontaktuj się z administratorem.</p>
        </div>
      }

      @if (error) {
        <div class="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ error }}
        </div>
      }

      @if (paymentHistory.length > 0) {
        <div class="mt-8">
          <h3 class="text-white font-black uppercase tracking-tight mb-3">Historia płatności</h3>
          <div class="space-y-2">
            @for (payment of paymentHistory; track payment.id) {
              <div class="flex justify-between items-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm">
                <div>
                  <span class="text-white font-medium">{{ payment.plan }}</span>
                  <span class="text-white/35 ml-2">{{ payment.amount }} {{ payment.currency | uppercase }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg"
                        [ngClass]="{
                          'bg-emerald-500/20 text-emerald-400': payment.status === 'completed',
                          'bg-yellow-500/20 text-yellow-400': payment.status === 'pending',
                          'bg-red-500/20 text-red-400': payment.status === 'failed'
                        }">
                    {{ payment.status === 'completed' ? 'Zapłacono' : payment.status === 'pending' ? 'Oczekuje' : 'Nieudana' }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SubscriptionComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  plans: any[] = [];
  paymentHistory: any[] = [];
  stripeConfigured = false;
  processingPlanId: number | null = null;
  error = '';

  async ngOnInit() {
    try {
      const [plans, status] = await Promise.all([
        this.api.getSubscriptionPlans(),
        this.api.getPaymentStatus(),
      ]);
      this.plans = plans;
      this.stripeConfigured = status.configured;

      if (this.auth.isLoggedIn()) {
        this.paymentHistory = await this.api.getPaymentHistory();
      }
    } catch {
      this.plans = [];
    }
  }

  isCurrentPlan(planId: number): boolean {
    return this.auth.currentUser()?.subscriptionPlan?.id === planId;
  }

  hasActiveSubscription(): boolean {
    const plan = this.auth.currentUser()?.subscriptionPlan;
    return !!plan && plan.name !== 'light';
  }

  async buyPlan(plan: any) {
    if (!this.stripeConfigured) {
      this.error = 'System płatności nie jest skonfigurowany';
      return;
    }

    this.error = '';
    this.processingPlanId = plan.id;

    try {
      const { url } = await this.api.createCheckout(plan.id);
      if (url) {
        window.location.href = url;
      }
    } catch (e: any) {
      this.error = e?.error?.error || 'Nie udało się utworzyć sesji płatności';
      this.processingPlanId = null;
    }
  }

  async manageSubscription() {
    try {
      const { url } = await this.api.createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } catch (e: any) {
      this.error = e?.error?.error || 'Nie udało się otworzyć portalu subskrypcji';
    }
  }
}
