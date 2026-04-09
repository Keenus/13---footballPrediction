import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'predictions', loadComponent: () => import('./pages/predictions/predictions.component').then(m => m.PredictionsComponent), canActivate: [authGuard] },
  { path: 'table', loadComponent: () => import('./pages/table/table.component').then(m => m.TableComponent), canActivate: [authGuard] },
  { path: 'history', loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent), canActivate: [authGuard] },
  { path: 'ranking', loadComponent: () => import('./pages/ranking/ranking.component').then(m => m.RankingComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'subscription', loadComponent: () => import('./pages/subscription/subscription.component').then(m => m.SubscriptionComponent), canActivate: [authGuard] },
  { path: 'join-league', loadComponent: () => import('./pages/join-league/join-league.component').then(m => m.JoinLeagueComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
