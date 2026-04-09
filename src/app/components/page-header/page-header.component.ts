import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="mb-6 sticky top-0 bg-zinc-950/60 backdrop-blur-3xl z-20 py-4 px-6 -mx-4 border-b border-white/10 shadow-sm">
      <h2 class="text-xl font-semibold text-white tracking-tight">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="text-blue-400 text-xs font-medium mt-0.5">{{ subtitle() }}</p>
      }
    </header>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
