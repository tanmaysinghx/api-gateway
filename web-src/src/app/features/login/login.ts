import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center mb-3">
            <img src="logo.png" class="h-10 w-10 rounded-xl shadow-md" alt="TS Logo">
          </div>
          <h1 class="text-lg font-bold text-slate-800 tracking-tight">
            TS API Gateway
          </h1>
          <p class="text-slate-500 text-xs mt-1">Enter credentials to unlock administrative console</p>
        </div>

        <app-glass-card title="Administrator Authentication" icon="🔐">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username / Email</label>
              <input type="email" name="username" [(ngModel)]="username" required
                class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                placeholder="administrator@domain.com">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Security Keyphrase</label>
              <input type="password" name="password" [(ngModel)]="password" required
                class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                placeholder="••••••••••••">
            </div>

            @if (errorMsg()) {
              <div class="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                ⚠️ {{ errorMsg() }}
              </div>
            }

            <button type="submit" [disabled]="loading()"
              class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 text-xs cursor-pointer">
              @if (loading()) {
                Verifying Credentials...
              } @else {
                Authenticate & Access Console
              }
            </button>
          </form>
        </app-glass-card>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  username = 'tanmaysinghx@gmail.com';
  password = 'Tanmay@1999';
  errorMsg = signal<string>('');
  loading = signal<boolean>(false);

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMsg.set('All credentials parameters are required.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.snackbar.show('Welcome back! Authenticated successfully.', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Authentication failed. Please verify credentials.');
        this.snackbar.show('Authentication failed!', 'error');
      }
    });
  }
}
