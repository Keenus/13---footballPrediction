import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, NgClass, FormsModule, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Panel Admina" subtitle="Zarządzaj użytkownikami"></app-page-header>

      <div class="space-y-3">
        @for (user of users; track user.id) {
          <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="font-semibold text-white text-sm">{{ user.username }}</div>
                <div class="text-zinc-400 text-xs">{{ user.email }}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold"
                      [ngClass]="{'bg-red-500/20 text-red-400': user.role === 'admin', 'bg-blue-500/20 text-blue-400': user.role === 'user'}">
                  {{ user.role }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold"
                      [ngClass]="{
                        'bg-amber-500/20 text-amber-400': user.subscriptionPlan?.name === 'gold',
                        'bg-emerald-500/20 text-emerald-400': user.subscriptionPlan?.name === 'standard',
                        'bg-zinc-500/20 text-zinc-400': !user.subscriptionPlan || user.subscriptionPlan.name === 'light'
                      }">
                  {{ user.subscriptionPlan?.display_name || 'Brak' }}
                </span>
              </div>
            </div>

            <div class="flex gap-2 mt-3">
              <select [ngModel]="user.role" (ngModelChange)="changeRole(user.id, $event)"
                      class="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select [ngModel]="user.subscriptionPlan?.id" (ngModelChange)="changePlan(user.id, $event)"
                      class="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500">
                @for (plan of plans; track plan.id) {
                  <option [value]="plan.id">{{ plan.display_name }}</option>
                }
              </select>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  users: any[] = [];
  plans: any[] = [];

  async ngOnInit() {
    try {
      [this.users, this.plans] = await Promise.all([
        this.api.getAllUsers(),
        this.api.getSubscriptionPlans(),
      ]);
    } catch {}
  }

  async changeRole(userId: number, role: string) {
    try {
      await this.api.updateUserRole(userId, role);
      const user = this.users.find(u => u.id === userId);
      if (user) user.role = role;
    } catch {}
  }

  async changePlan(userId: number, planId: any) {
    try {
      const result = await this.api.updateUserSubscription(userId, parseInt(planId, 10));
      const user = this.users.find(u => u.id === userId);
      if (user) user.subscriptionPlan = result.subscriptionPlan;
    } catch {}
  }
}
