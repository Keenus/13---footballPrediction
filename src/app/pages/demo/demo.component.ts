import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="p-4 max-w-md mx-auto pb-24 text-center py-20">
      <mat-icon class="text-6xl text-zinc-600 mb-4">sports_soccer</mat-icon>
      <h2 class="text-xl font-bold text-white mb-2">Demo niedostępne</h2>
      <p class="text-zinc-400 text-sm mb-6">Tryb demo został zastąpiony przez pełną wersję z bazą danych.</p>
      <a routerLink="/dashboard" class="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">Przejdź do dashboardu</a>
    </div>
  `
})
export class DemoComponent {}
