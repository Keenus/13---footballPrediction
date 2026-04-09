import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  calculatePoints(predHome: number, predAway: number, actualHome: number, actualAway: number): number {
    if (predHome === actualHome && predAway === actualAway) {
      return 3;
    }
    
    const predDiff = predHome - predAway;
    const actualDiff = actualHome - actualAway;
    
    if (predDiff === actualDiff) {
      return 2;
    }
    
    const predWinner = predHome > predAway ? 1 : predHome < predAway ? -1 : 0;
    const actualWinner = actualHome > actualAway ? 1 : actualHome < actualAway ? -1 : 0;
    
    if (predWinner === actualWinner) {
      return 1;
    }
    
    return 0;
  }
}
