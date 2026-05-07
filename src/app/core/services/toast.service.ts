import { Injectable, signal } from '@angular/core';

export type ToastType = 'default' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'default', duration = 3500) {
    const id = ++this.counter;
    this.toasts.update(ts => [...ts, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string)   { this.show(message, 'danger'); }
  warning(message: string) { this.show(message, 'warning'); }

  dismiss(id: number) {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
