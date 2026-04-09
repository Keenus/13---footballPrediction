import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ---- Leagues ----
  getLeagues() {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/leagues`));
  }

  getLeague(id: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${id}`));
  }

  createLeague(name: string, teamNames?: string[]) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues`, { name, teamNames }));
  }

  joinLeague(inviteCode: string) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/join`, { inviteCode }));
  }

  leaveLeague(id: number) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/${id}/leave`, {}));
  }

  deleteLeague(id: number) {
    return firstValueFrom(this.http.delete<any>(`${this.base}/leagues/${id}`));
  }

  getInviteCode(leagueId: number) {
    return firstValueFrom(this.http.get<{ inviteCode: string }>(`${this.base}/leagues/${leagueId}/invite-code`));
  }

  // ---- Rounds ----
  getCurrentRound(leagueId: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/rounds/current`));
  }

  simulateRound(leagueId: number) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/${leagueId}/rounds/simulate`, {}));
  }

  nextRound(leagueId: number) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/${leagueId}/rounds/next`, {}));
  }

  // ---- Predictions ----
  getPredictions(leagueId: number, roundId: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/predictions/${roundId}`));
  }

  savePredictions(leagueId: number, roundId: number, predictions: any[]) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/${leagueId}/predictions/${roundId}`, { predictions }));
  }

  // ---- Ranking ----
  getRanking(leagueId: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/ranking`));
  }

  // ---- Table ----
  getTable(leagueId: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/table`));
  }

  // ---- History ----
  getHistory(leagueId: number) {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/leagues/${leagueId}/history`));
  }

  // ---- Scoring ----
  getScoringRules(leagueId: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/scoring`));
  }

  updateScoringRules(leagueId: number, rules: any) {
    return firstValueFrom(this.http.put<any>(`${this.base}/leagues/${leagueId}/scoring`, rules));
  }

  // ---- Users (admin) ----
  getMyStats() {
    return firstValueFrom(this.http.get<any>(`${this.base}/users/me`));
  }

  updateProfile(data: { username?: string; avatar?: string }) {
    return firstValueFrom(this.http.put<any>(`${this.base}/users/me`, data));
  }

  getAllUsers() {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/users`));
  }

  updateUserRole(userId: number, role: string) {
    return firstValueFrom(this.http.put<any>(`${this.base}/users/${userId}/role`, { role }));
  }

  updateUserSubscription(userId: number, subscriptionPlanId: number) {
    return firstValueFrom(this.http.put<any>(`${this.base}/users/${userId}/subscription`, { subscriptionPlanId }));
  }

  // ---- Subscription Plans ----
  getSubscriptionPlans() {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/subscription-plans`));
  }
}
