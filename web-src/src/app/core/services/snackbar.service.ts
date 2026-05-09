import { Injectable, signal } from '@angular/core';

export interface SnackbarMessage {
  text: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  messages = signal<SnackbarMessage[]>([]);
  private nextId = 0;

  show(text: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = this.nextId++;
    const message: SnackbarMessage = { text, type, id };
    
    this.messages.update(prev => [...prev, message]);
    
    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }

  dismiss(id: number) {
    this.messages.update(prev => prev.filter(m => m.id !== id));
  }
}
