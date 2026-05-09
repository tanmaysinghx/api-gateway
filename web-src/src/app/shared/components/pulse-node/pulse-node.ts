import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pulse-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <span class="relative flex h-2 w-2">
        @if (healthy) {
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        } @else {
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        }
      </span>
      <span class="text-xs font-semibold" [ngClass]="healthy ? 'text-emerald-700' : 'text-rose-700'">
        {{ label }}
      </span>
    </div>
  `
})
export class PulseNodeComponent {
  @Input() healthy: boolean = false;
  @Input() label: string = '';
}
