import { Injectable, inject } from '@angular/core';
import { Match } from '../models/match.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class DemoService {
  private storage = inject(StorageService);

  getDemoMatches(): Match[] {
    const teams = this.storage.state().teams;
    const findTeam = (name: string) => teams.find(t => t.name === name)?.id || '';

    return [
      { id: 'd1', homeTeamId: findTeam('Orły Warszawa'), awayTeamId: findTeam('Wilki Kraków'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd2', homeTeamId: findTeam('Tygrysy Gdańsk'), awayTeamId: findTeam('Rekiny Wrocław'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd3', homeTeamId: findTeam('Lwy Poznań'), awayTeamId: findTeam('Sokoły Łódź'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd4', homeTeamId: findTeam('Pantery Szczecin'), awayTeamId: findTeam('Jastrzębie Lublin'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd5', homeTeamId: findTeam('Wilki Kraków'), awayTeamId: findTeam('Tygrysy Gdańsk'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd6', homeTeamId: findTeam('Rekiny Wrocław'), awayTeamId: findTeam('Lwy Poznań'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd7', homeTeamId: findTeam('Sokoły Łódź'), awayTeamId: findTeam('Pantery Szczecin'), homeScore: null, awayScore: null, isPlayed: false },
      { id: 'd8', homeTeamId: findTeam('Jastrzębie Lublin'), awayTeamId: findTeam('Orły Warszawa'), homeScore: null, awayScore: null, isPlayed: false },
    ];
  }
}
