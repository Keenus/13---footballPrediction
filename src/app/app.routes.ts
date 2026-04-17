import { Routes } from '@angular/router';
import { authGuard, adminGuard, userGuard, guestGuard, roleRedirectGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', canActivate: [roleRedirectGuard], children: [] },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },

  // User pages - blocked for admins
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard, userGuard] },
  { path: 'predictions', loadComponent: () => import('./pages/predictions/predictions.component').then(m => m.PredictionsComponent), canActivate: [authGuard, userGuard] },
  { path: 'history', loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent), canActivate: [authGuard, userGuard] },
  { path: 'ranking', loadComponent: () => import('./pages/ranking/ranking.component').then(m => m.RankingComponent), canActivate: [authGuard, userGuard] },
  { path: 'subscription', loadComponent: () => import('./pages/subscription/subscription.component').then(m => m.SubscriptionComponent), canActivate: [authGuard, userGuard] },
  { path: 'join-league', loadComponent: () => import('./pages/join-league/join-league.component').then(m => m.JoinLeagueComponent), canActivate: [authGuard, userGuard] },
  { path: 'payment-success', loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent), canActivate: [authGuard, userGuard] },
  { path: 'payment-cancel', loadComponent: () => import('./pages/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent), canActivate: [authGuard, userGuard] },

  // Admin pages
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [authGuard, adminGuard] },
  { path: 'support', loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent), canActivate: [authGuard, adminGuard] },

  // Shared
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },

  { path: '**', canActivate: [roleRedirectGuard], children: [] },
];
