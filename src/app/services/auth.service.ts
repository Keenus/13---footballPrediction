import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment';

export interface SubscriptionPlan {
  id: number;
  name: string;
  display_name: string;
  max_created_leagues: number | null;
  max_joined_leagues: number | null;
  can_create_leagues: boolean;
  full_statistics: boolean;
  custom_scoring: boolean;
  price: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  username: string;
  avatar: string;
  role: 'admin' | 'user';
  subscriptionPlan: SubscriptionPlan | null;
}

interface AuthResponse {
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<CurrentUser | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  canCreateLeagues = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.subscriptionPlan?.can_create_leagues ?? false;
  });

  hasFullStats = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.subscriptionPlan?.full_statistics ?? false;
  });

  hasCustomScoring = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.subscriptionPlan?.custom_scoring ?? false;
  });

  async init(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<CurrentUser>(`${environment.apiUrl}/auth/me`)
      );
      this.currentUser.set(user);
    } catch {
      // 401 = brak sesji, user pozostaje null
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );
    this.currentUser.set(res.user);
  }

  async register(email: string, password: string, username: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password, username })
    );
    this.currentUser.set(res.user);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${environment.apiUrl}/auth/logout`, {})
      );
    } finally {
      this.clearUser();
    }
  }

  clearUser(): void {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
