import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { PulseNodeComponent } from '../../shared/components/pulse-node/pulse-node';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, PulseNodeComponent],
  template: `
    <div class="space-y-5">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-base font-bold text-slate-800 flex items-center gap-2">
            🌐 Ingress Cluster Routing & Registry
          </h1>
          <p class="text-xs text-slate-500">Register, monitor, and configure active target microservices on the gateway</p>
        </div>

        <!-- Quick Setup Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button (click)="triggerExport()"
            class="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-[11px] shadow-sm transition-all duration-200 cursor-pointer">
            📥 Export Config
          </button>

          <button (click)="fileInput.click()"
            class="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-bold px-3 py-1.5 rounded-lg border border-primary text-[11px] shadow-sm transition-all duration-200 cursor-pointer">
            📤 Import Config
          </button>
          <input #fileInput type="file" (change)="onFileSelected($event)" accept=".json" class="hidden">
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <!-- Services Registry List (Takes 2 columns) -->
        <div class="lg:col-span-2">
          <app-glass-card title="Active Microservices Catalog" icon="📋" extraClass="h-full">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    <th class="pb-2.5">Cluster Info</th>
                    <th class="pb-2.5">Route Prefix</th>
                    <th class="pb-2.5">Protocol / Tech</th>
                    <th class="pb-2.5">Active Instances Status</th>
                    <th class="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  @for (svc of services(); track svc.id) {
                    <tr>
                      <td class="py-3 pr-2">
                        <div class="font-bold text-slate-800">{{ svc.name }}</div>
                        <div class="text-[9px] text-slate-400 font-mono">{{ svc.id }}</div>
                      </td>
                      <td class="py-3 font-mono text-primary font-semibold text-[11px]">{{ svc.prefix }}</td>
                      <td class="py-3">
                        <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 mr-1 text-slate-600">
                          {{ svc.protocol }}
                        </span>
                        <span class="text-[10px] text-slate-500 font-medium">{{ svc.tech_stack }}</span>
                      </td>
                      <td class="py-3">
                        <div class="flex flex-col gap-1.5">
                          @for (inst of svc.instances; track inst.id) {
                            <app-pulse-node [healthy]="inst.healthy" [label]="inst.url"></app-pulse-node>
                          } @empty {
                            <span class="text-[10px] text-slate-400 italic">No node instances added</span>
                          }
                        </div>
                      </td>
                      <td class="py-3 text-right">
                        <button (click)="deleteService(svc.id)"
                          class="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-rose-100 hover:border-rose-600 transition-all duration-200 cursor-pointer">
                          De-register
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-16 text-center text-slate-400 italic">
                        No active microservices registered in Gateway Catalog.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </app-glass-card>
        </div>

        <!-- Register Form Sidebar (Takes 1 column) -->
        <div>
          <app-glass-card title="Register New Cluster" icon="➕">
            <form (ngSubmit)="registerService()" class="space-y-3.5 text-xs">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Identifier (ID)</label>
                <input type="text" name="id" [(ngModel)]="form.id" required
                  class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  placeholder="users-cluster">
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Human-Friendly Name</label>
                <input type="text" name="name" [(ngModel)]="form.name" required
                  class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  placeholder="User Profile Management">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Protocol</label>
                  <select name="protocol" [(ngModel)]="form.protocol"
                    class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200">
                    <option value="REST">REST</option>
                    <option value="SOAP">SOAP</option>
                    <option value="gRPC">gRPC</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Route Prefix</label>
                  <input type="text" name="prefix" [(ngModel)]="form.prefix" required
                    class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    placeholder="/api">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tech Stack</label>
                  <input type="text" name="techStack" [(ngModel)]="form.techStack"
                    class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    placeholder="Go">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Health Path</label>
                  <input type="text" name="healthCheckPath" [(ngModel)]="form.healthCheckPath"
                    class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    placeholder="/health">
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Instances (CSV)</label>
                <input type="text" name="instances" [(ngModel)]="form.instances" required
                  class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  placeholder="http://localhost:8081,http://localhost:8082">
              </div>

              <div class="flex items-center gap-2 py-0.5">
                <input type="checkbox" name="requiresAuth" [(ngModel)]="form.requiresAuth" id="requiresAuth"
                  class="accent-primary h-3.5 w-3.5 border-slate-300 rounded cursor-pointer">
                <label for="requiresAuth" class="text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none cursor-pointer">Enforce Cryptographic Auth</label>
              </div>

              <div class="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rate Limit (req/s)</label>
                  <input type="number" name="rateLimitLimit" [(ngModel)]="form.rateLimitLimit"
                    class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    placeholder="10.0">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Burst Margin</label>
                  <input type="number" name="rateLimitBurst" [(ngModel)]="form.rateLimitBurst"
                    class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    placeholder="15">
                </div>
              </div>

              <button type="submit"
                class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 text-xs cursor-pointer">
                Deploy Cluster Configuration
              </button>
            </form>
          </app-glass-card>
        </div>

      </div>
    </div>
  `
})
export class ServicesComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);

  services = signal<any[]>([]);
  private pollInterval: any;

  form = {
    id: '',
    name: '',
    prefix: '',
    protocol: 'REST',
    techStack: 'Go',
    healthCheckPath: '/health',
    instances: '',
    requiresAuth: false,
    rateLimitLimit: 10,
    rateLimitBurst: 15
  };

  ngOnInit() {
    this.fetchServices();
    this.pollInterval = setInterval(() => this.fetchServices(), 2000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchServices() {
    this.api.getServices().subscribe({
      next: (data) => this.services.set(data || []),
      error: (err) => console.error('Failed to poll catalog', err)
    });
  }

  registerService() {
    if (!this.form.id || !this.form.name || !this.form.prefix || !this.form.instances) {
      this.snackbar.show('ID, Name, Prefix, and instances are required!', 'error');
      return;
    }

    const payload = {
      id: this.form.id,
      name: this.form.name,
      prefix: this.form.prefix,
      protocol: this.form.protocol,
      tech_stack: this.form.techStack,
      health_check_path: this.form.healthCheckPath,
      load_balancer_policy: 'RoundRobin',
      instances: this.form.instances.split(',').map(url => url.trim()),
      requires_auth: this.form.requiresAuth,
      rate_limit_limit: this.form.rateLimitLimit,
      rate_limit_burst: this.form.rateLimitBurst
    };

    this.api.registerService(payload).subscribe({
      next: () => {
        this.fetchServices();
        this.snackbar.show(`Cluster '${payload.id}' deployed successfully!`, 'success');
        this.form = {
          id: '',
          name: '',
          prefix: '',
          protocol: 'REST',
          techStack: 'Go',
          healthCheckPath: '/health',
          instances: '',
          requiresAuth: false,
          rateLimitLimit: 10,
          rateLimitBurst: 15
        };
      },
      error: (err) => {
        this.snackbar.show('Failed to register cluster!', 'error');
        console.error(err);
      }
    });
  }

  deleteService(id: string) {
    if (confirm(`De-register cluster ${id} from Gateway catalog?`)) {
      this.api.deregisterService(id).subscribe({
        next: () => {
          this.fetchServices();
          this.snackbar.show(`Cluster '${id}' removed from catalog!`, 'info');
        },
        error: (err) => {
          this.snackbar.show('Failed to de-register cluster!', 'error');
          console.error(err);
        }
      });
    }
  }

  triggerExport() {
    this.api.exportConfig().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ts-gateway-services-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackbar.show('Configuration backup downloaded!', 'success');
      },
      error: (err) => {
        this.snackbar.show('Failed to download configuration backup!', 'error');
        console.error(err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!Array.isArray(json)) {
          this.snackbar.show('Invalid config! Expected a services array.', 'error');
          return;
        }

        this.api.importConfig(json).subscribe({
          next: () => {
            this.fetchServices();
            this.snackbar.show(`Imported ${json.length} cluster configurations successfully!`, 'success');
            event.target.value = '';
          },
          error: (err) => {
            this.snackbar.show('Failed to upload configurations to server!', 'error');
            console.error(err);
          }
        });
      } catch (err) {
        this.snackbar.show('Failed to parse file! Ensure it is valid JSON.', 'error');
      }
    };
    reader.readAsText(file);
  }
}
