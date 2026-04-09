import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  token: string;
  user: CurrentUser;
}

const TOKEN_KEY = 'fp_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

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

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  async init(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      const user = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/auth/me`)
      );
      this.currentUser.set(user);
    } catch {
      this.logout();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, res.token);
    }
    this.currentUser.set(res.user);
  }

  async register(email: string, password: string, username: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password, username })
    );
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, res.token);
    }
    this.currentUser.set(res.user);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
