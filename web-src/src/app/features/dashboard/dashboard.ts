import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { LogsComponent } from '../logs/logs';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, LogsComponent],
  template: `
    <div class="space-y-5">
      <!-- Header Section -->
      <div>
        <h1 class="text-base font-bold text-slate-800 flex items-center gap-2">
          📊 Performance Metrics & Telemetry
        </h1>
        <p class="text-xs text-slate-500">Real-time health statistics and system ingress logs</p>
      </div>

      <!-- Telemetry Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-glass-card title="Active Sockets" icon="🔌" extraClass="border-slate-100">
          <div class="text-xl font-bold text-primary">
            {{ stats().active_connections || 0 }}
          </div>
          <p class="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1">Concurrent TCP Channels</p>
        </app-glass-card>

        <app-glass-card title="Telemetry Requests" icon="📊" extraClass="border-slate-100">
          <div class="text-xl font-bold text-violet-600">
            {{ stats().total_requests || 0 }}
          </div>
          <p class="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1">Aggregated Ingress Vol</p>
        </app-glass-card>

        <app-glass-card title="System Latency" icon="⚡" extraClass="border-slate-100">
          <div class="text-xl font-bold text-emerald-600">
            {{ stats().average_latency_ms ? stats().average_latency_ms.toFixed(2) + 'ms' : '0.00ms' }}
          </div>
          <p class="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1">Avg Execution Overhead</p>
        </app-glass-card>

        <app-glass-card title="Error Telemetry" icon="🛡️" extraClass="border-slate-100">
          <div class="text-xl font-bold text-rose-600">
            {{ stats().error_rate_percent ? stats().error_rate_percent.toFixed(2) + '%' : '0.00%' }}
          </div>
          <p class="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1">Ingress Error Overhead</p>
        </app-glass-card>
      </div>

      <!-- Log Terminal & Dev Sandbox row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Log Terminal takes 2 cols -->
        <div class="lg:col-span-2">
          <app-logs></app-logs>
        </div>

        <!-- Dev Sandbox takes 1 col -->
        <div>
          <app-glass-card title="Developer Token Sandbox" icon="🛠️" extraClass="border-slate-100">
            <div class="text-xs space-y-3.5">
              <p class="text-slate-500 leading-normal text-[11px]">
                Enforce JWT authentication for a microservice and generate test administrative authorization tokens here to bypass ingress checks.
              </p>
              
              <button (click)="generateToken()"
                class="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200 hover:border-slate-300 font-bold py-2 rounded-lg transition-all duration-200 text-xs cursor-pointer">
                Generate Secure JWT Token
              </button>

              @if (jwtToken()) {
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 relative font-mono text-[10px] break-all leading-relaxed text-slate-600 select-all shadow-inner">
                  <div class="flex items-center justify-between font-sans text-[9px] font-bold text-primary mb-1 uppercase tracking-wider">
                    <span>Authorized JWT Token (Bearer)</span>
                    <button (click)="copyToken()" class="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer font-bold border border-slate-200 rounded px-1.5 py-0.5 bg-white shadow-sm">
                      📋 Copy
                    </button>
                  </div>
                  Bearer {{ jwtToken() }}
                </div>
              }
            </div>
          </app-glass-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);

  stats = signal<any>({});
  jwtToken = signal<string>('');
  private statsInterval: any;

  ngOnInit() {
    this.refreshStats();
    this.statsInterval = setInterval(() => this.refreshStats(), 2000);
  }

  ngOnDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  refreshStats() {
    this.api.getStats().subscribe({
      next: (data) => this.stats.set(data || {}),
      error: (err) => console.error('Failed to poll telemetry', err)
    });
  }

  generateToken() {
    this.api.generateToken().subscribe({
      next: (res) => {
        if (res && res.token) {
          this.jwtToken.set(res.token);
          this.snackbar.show('Cryptographic JWT generated successfully!', 'success');
        }
      },
      error: (err) => {
        this.snackbar.show('Failed to generate JWT!', 'error');
        console.error(err);
      }
    });
  }

  copyToken() {
    const fullToken = 'Bearer ' + this.jwtToken();
    navigator.clipboard.writeText(fullToken).then(() => {
      this.snackbar.show('Bearer JWT copied to clipboard!', 'success');
    }).catch(err => {
      this.snackbar.show('Failed to copy token!', 'error');
    });
  }
}
