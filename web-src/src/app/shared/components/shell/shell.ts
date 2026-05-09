import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden">
      
      <!-- 1. LEFT NAVIGATION SIDEBAR -->
      <aside class="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 relative z-20 shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
        <!-- Logo Header -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <img src="logo.png" class="w-7 h-7 rounded-lg shadow-sm" alt="TS Logo">
          <div>
            <h1 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
              TS Gateway
            </h1>
            <p class="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Control Panel</p>
          </div>
        </div>

        <!-- Navigation Lists -->
        <nav class="flex-grow p-3.5 space-y-1.5">
          <a routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent transition-all duration-200 group">
            <span class="text-sm group-hover:scale-105 transition-transform duration-200">📊</span>
            <span class="text-xs font-bold">Metrics Dashboard</span>
          </a>

          <a routerLink="/services" routerLinkActive="active-link"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent transition-all duration-200 group">
            <span class="text-sm group-hover:scale-105 transition-transform duration-200">🌐</span>
            <span class="text-xs font-bold">Services Catalog</span>
          </a>
        </nav>

        <!-- Footer Info -->
        <div class="p-4 border-t border-slate-100 text-[9px] text-slate-400 font-bold uppercase tracking-wider space-y-1">
          <div>Engine Ver: v1.2.6</div>
          <div class="text-emerald-600 flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Status: Healthy
          </div>
        </div>
      </aside>

      <!-- 2. RIGHT CONTAINER -->
      <div class="flex-grow flex flex-col min-w-0 relative z-10 overflow-hidden">
        
        <!-- Top header -->
        <header class="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div>
            <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
              System Ingress Node Console
            </h2>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Account
            </span>
            <button (click)="logout()"
              class="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200 hover:border-slate-300 text-[10px] font-bold px-3 py-1 rounded-md transition-all duration-200 cursor-pointer">
              Terminate Session
            </button>
          </div>
        </header>

        <!-- Dynamic Content Shell -->
        <main class="flex-grow overflow-y-auto p-5 min-h-0 bg-slate-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .active-link {
      background: #eff6ff !important;
      border-color: #bfdbfe !important;
      color: #1d4ed8 !important;
    }
  `]
})
export class ShellComponent {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
