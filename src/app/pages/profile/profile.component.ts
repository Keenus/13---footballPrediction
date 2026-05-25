import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24">
      <app-page-header title="Profil" subtitle="Twoje konto i statystyki"></app-page-header>

      @if (auth.currentUser(); as user) {
        <div class="space-y-4">
          <div class="relative overflow-hidden bg-[#262220] border border-white/[0.06] rounded-3xl p-5">
            <mat-icon class="absolute right-[-10px] bottom-[-10px] text-[100px] w-[100px] h-[100px] opacity-[0.04] pointer-events-none text-white">person</mat-icon>
            <div class="relative z-[1]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-2xl bg-[#FEF400] flex items-center justify-center text-[#1E1A17]">
                  <mat-icon class="text-[28px] w-7 h-7">{{ user.avatar }}</mat-icon>
                </div>
                <div>
                  <h2 class="text-lg font-black text-white uppercase tracking-tight">{{ user.username }}</h2>
                  <p class="text-white/35 text-xs">{{ user.email }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold"
                          [class]="user.role === 'admin' ? 'bg-red-500/10 text-red-400 rounded-lg' : 'bg-[#FEF400]/[0.08] text-[#FEF400]/70 rounded-lg'">
                      {{ user.role === 'admin' ? 'Admin' : 'Użytkownik' }}
                    </span>
                    @if (user.subscriptionPlan) {
                      <span class="px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider font-bold"
                            [class]="user.subscriptionPlan.name === 'gold' ? 'bg-amber-500/20 text-amber-400' : user.subscriptionPlan.name === 'standard' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'">
                        {{ user.subscriptionPlan.display_name }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              @if (editing) {
                <div class="space-y-3 pt-3 border-t border-white/10">
                  <div>
                    <label class="block text-white/35 text-xs font-medium mb-1">Nazwa</label>
                    <input type="text" [(ngModel)]="editUsername"
                           class="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FEF400]/30 transition-all">
                  </div>
                  <div class="flex gap-2">
                    <button (click)="save()" class="flex-1 py-2 bg-[#FEF400] hover:bg-[#e5dc00] text-[#1E1A17] text-sm uppercase tracking-wider font-bold rounded-xl transition-all">Zapisz</button>
                    <button (click)="editing = false" class="flex-1 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm uppercase tracking-wider font-bold rounded-xl transition-all">Anuluj</button>
                  </div>
                </div>
              } @else {
                <button (click)="startEdit()" class="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm uppercase tracking-wider font-bold rounded-xl transition-all mt-2 border border-white/[0.06]">
                  Edytuj profil
                </button>
              }
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-3 text-center">
              <mat-icon class="text-[#FEF400]/60 text-[20px] w-5 h-5 mb-1 mx-auto">stars</mat-icon>
              <div class="text-xl font-bold text-white leading-none">{{ stats?.totalPoints || 0 }}</div>
              <div class="text-[9px] text-white/35 uppercase tracking-widest mt-1 font-medium">Punkty</div>
            </div>
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-3 text-center">
              <mat-icon class="text-emerald-400 text-[20px] w-5 h-5 mb-1 mx-auto">my_location</mat-icon>
              <div class="text-xl font-bold text-white leading-none">{{ stats?.exactScores || 0 }}</div>
              <div class="text-[9px] text-white/35 uppercase tracking-widest mt-1 font-medium">Dokładne</div>
            </div>
            <div class="bg-[#262220] border border-white/[0.06] rounded-2xl p-3 text-center">
              <mat-icon class="text-amber-400 text-[20px] w-5 h-5 mb-1 mx-auto">check_circle</mat-icon>
              <div class="text-xl font-bold text-white leading-none">{{ stats?.correctResults || 0 }}</div>
              <div class="text-[9px] text-white/35 uppercase tracking-widest mt-1 font-medium">Trafione</div>
            </div>
          </div>

          <a routerLink="/subscription" class="block bg-[#FEF400]/[0.06] border border-[#FEF400]/10 rounded-2xl p-4 hover:border-[#FEF400]/20 transition-all">
            <div class="flex items-center gap-3">
              <mat-icon class="text-[#FEF400]">workspace_premium</mat-icon>
              <div>
                <div class="text-white font-bold text-sm">Zmień plan subskrypcji</div>
                <div class="text-[#FEF400]/50 text-xs">Odblokuj więcej możliwości</div>
              </div>
              <mat-icon class="text-[#FEF400]/40 ml-auto">chevron_right</mat-icon>
            </div>
          </a>

          <button (click)="auth.logout()" class="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 uppercase tracking-wider font-bold rounded-xl transition-all text-sm">
            Wyloguj się
          </button>
        </div>
      } @else {
        <div class="text-center text-white/35 py-16">
          <mat-icon class="text-4xl mb-2 opacity-50 animate-spin">refresh</mat-icon>
          <p class="text-sm">Ładowanie profilu...</p>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  stats: any = null;
  editing = false;
  editUsername = '';

  async ngOnInit() {
    try {
      const data = await this.api.getMyStats();
      this.stats = data.stats;
    } catch {}
  }

  startEdit() {
    this.editUsername = this.auth.currentUser()?.username || '';
    this.editing = true;
  }

  async save() {
    try {
      const result = await this.api.updateProfile({ username: this.editUsername });
      this.auth.currentUser.set(result);
      this.editing = false;
      this.toast.success('Profil zaktualizowany');
    } catch {}
  }
}
