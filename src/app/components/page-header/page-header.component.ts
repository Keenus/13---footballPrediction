import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-5">
      <h2 class="text-lg font-black text-white tracking-tight">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="text-[11px] text-white/30 mt-0.5 font-medium">{{ subtitle() }}</p>
      }
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
