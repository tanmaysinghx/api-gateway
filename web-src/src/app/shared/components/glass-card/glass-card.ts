import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  template: `
    <div class="relative bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] {{ extraClass }}">
      @if (title) {
        <div class="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5">
          <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
            @if (icon) {
              <span class="text-primary text-sm">{{ icon }}</span>
            }
            {{ title }}
          </h3>
          <ng-content select="[card-header-actions]"></ng-content>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class GlassCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() extraClass: string = '';
}
