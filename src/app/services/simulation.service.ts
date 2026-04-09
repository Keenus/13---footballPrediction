import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  generateScore(): number {
    const rand = Math.random();
    if (rand < 0.25) return 0;
    if (rand < 0.50) return 1;
    if (rand < 0.75) return 2;
    if (rand < 0.90) return 3;
    if (rand < 0.97) return 4;
    return 5;
  }
}
