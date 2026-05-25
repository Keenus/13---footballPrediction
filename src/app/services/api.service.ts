import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ---- Competitions ----
  getCompetitions() {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/competitions`));
  }

  getCompetition(id: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/competitions/${id}`));
  }

  createCompetition(data: { name: string; type?: string; season?: string }) {
    return firstValueFrom(this.http.post<any>(`${this.base}/competitions`, data));
  }

  updateCompetition(id: number, data: { name?: string; type?: string; season?: string; isFinished?: boolean }) {
    return firstValueFrom(this.http.put<any>(`${this.base}/competitions/${id}`, data));
  }

  deleteCompetition(id: number) {
    return firstValueFrom(this.http.delete<any>(`${this.base}/competitions/${id}`));
  }

  addCompetitionTeams(competitionId: number, teams: string[]) {
    return firstValueFrom(this.http.post<any>(`${this.base}/competitions/${competitionId}/teams`, { teams }));
  }

  updateTeam(competitionId: number, teamId: number, name: string) {
    return firstValueFrom(this.http.put<any>(`${this.base}/competitions/${competitionId}/teams/${teamId}`, { name }));
  }

  deleteTeam(competitionId: number, teamId: number) {
    return firstValueFrom(this.http.delete<any>(`${this.base}/competitions/${competitionId}/teams/${teamId}`));
  }

  getMatches(competitionId: number) {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/competitions/${competitionId}/matches`));
  }

  addMatch(competitionId: number, data: { homeTeamId: number; awayTeamId: number; deadline?: string; roundId?: number }) {
    return firstValueFrom(this.http.post<any>(`${this.base}/competitions/${competitionId}/matches`, data));
  }

  updateMatch(competitionId: number, matchId: number, data: { homeTeamId?: number; awayTeamId?: number; deadline?: string | null; roundId?: number }) {
    return firstValueFrom(this.http.put<any>(`${this.base}/competitions/${competitionId}/matches/${matchId}`, data));
  }

  deleteMatch(competitionId: number, matchId: number) {
    return firstValueFrom(this.http.delete<any>(`${this.base}/competitions/${competitionId}/matches/${matchId}`));
  }

  addCompetitionRound(competitionId: number, data: { number: number; name?: string; matches?: { homeTeamId: number; awayTeamId: number }[] }) {
    return firstValueFrom(this.http.post<any>(`${this.base}/competitions/${competitionId}/rounds`, data));
  }

  updateRound(competitionId: number, roundId: number, data: { name?: string; number?: number }) {
    return firstValueFrom(this.http.put<any>(`${this.base}/competitions/${competitionId}/rounds/${roundId}`, data));
  }

  deleteRound(competitionId: number, roundId: number) {
    return firstValueFrom(this.http.delete<any>(`${this.base}/competitions/${competitionId}/rounds/${roundId}`));
  }

  updateRoundResults(competitionId: number, roundId: number, results: { matchId: number; homeScore: number; awayScore: number }[]) {
    return firstValueFrom(this.http.put<any>(`${this.base}/competitions/${competitionId}/rounds/${roundId}/results`, { results }));
  }

  // ---- Leagues ----
  getLeagues() {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/leagues`));
  }

  getLeague(id: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${id}`));
  }

  createLeague(name: string, competitionIds: number[]) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues`, { name, competitionIds }));
  }

  addCompetitionToLeague(leagueId: number, competitionId: number) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/${leagueId}/competitions`, { competitionId }));
  }

  removeCompetitionFromLeague(leagueId: number, competitionId: number) {
    return firstValueFrom(this.http.delete<any>(`${this.base}/leagues/${leagueId}/competitions/${competitionId}`));
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
  getRounds(leagueId: number) {
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/rounds`));
  }

  getCurrentRound(leagueId: number, competitionId?: number) {
    const params = competitionId ? `?competitionId=${competitionId}` : '';
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/rounds/current${params}`));
  }

  nextRound(leagueId: number, competitionId?: number) {
    return firstValueFrom(this.http.post<any>(`${this.base}/leagues/${leagueId}/rounds/next`, { competitionId }));
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
  getTable(leagueId: number, competitionId?: number) {
    const params = competitionId ? `?competitionId=${competitionId}` : '';
    return firstValueFrom(this.http.get<any>(`${this.base}/leagues/${leagueId}/table${params}`));
  }

  // ---- History ----
  getHistory(leagueId: number, competitionId?: number) {
    const params = competitionId ? `?competitionId=${competitionId}` : '';
    return firstValueFrom(this.http.get<any[]>(`${this.base}/leagues/${leagueId}/history${params}`));
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

  // ---- Payments ----
  getPaymentStatus() {
    return firstValueFrom(this.http.get<{ configured: boolean }>(`${this.base}/payments/status`));
  }

  createCheckout(planId: number) {
    return firstValueFrom(this.http.post<{ url: string }>(`${this.base}/payments/create-checkout`, { planId }));
  }

  createPortalSession() {
    return firstValueFrom(this.http.post<{ url: string }>(`${this.base}/payments/create-portal`, {}));
  }

  getPaymentHistory() {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/payments/history`));
  }

  setupStripe() {
    return firstValueFrom(this.http.post<any>(`${this.base}/payments/setup-stripe`, {}));
  }
}
