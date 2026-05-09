import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SnackbarService } from './core/services/snackbar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <router-outlet></router-outlet>

    <!-- Global Snackbar / Toast Container -->
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      @for (msg of snackbar.messages(); track msg.id) {
        <div class="pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-sm transition-all duration-300 transform translate-y-0 scale-100"
          [ngClass]="{
            'bg-emerald-50 border-emerald-200 text-emerald-800': msg.type === 'success',
            'bg-rose-50 border-rose-200 text-rose-800': msg.type === 'error',
            'bg-blue-50 border-blue-200 text-blue-800': msg.type === 'info'
          }">
          <div class="flex items-center gap-2.5 text-xs font-semibold">
            <span>
              @if (msg.type === 'success') { ✅ }
              @else if (msg.type === 'error') { ❌ }
              @else { ℹ️ }
            </span>
            <span>{{ msg.text }}</span>
          </div>
          <button (click)="snackbar.dismiss(msg.id)"
            class="text-slate-400 hover:text-slate-600 ml-4 cursor-pointer focus:outline-none font-bold text-xs">
            ✕
          </button>
        </div>
      }
    </div>
  `
})
export class App {
  protected readonly title = signal('web-src');
  protected readonly snackbar = inject(SnackbarService);
}
