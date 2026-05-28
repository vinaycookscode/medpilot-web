import { Injectable, signal } from '@angular/core';

export type GwToastVariant = 'info' | 'success' | 'warning' | 'danger';
export type GwToastPosition =
  | 'top-right' | 'top-center' | 'top-left'
  | 'bottom-right' | 'bottom-center' | 'bottom-left';

export interface GwToast {
  id: number;
  variant: GwToastVariant;
  title: string;
  description?: string;
  duration: number;
  action?: { label: string; onClick: () => void };
}

export interface GwToastOptions {
  description?: string;
  /** Auto-dismiss in ms. 0 = persist until manually closed. Default 4000. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

@Injectable({ providedIn: 'root' })
export class GwToastService {
  readonly toasts = signal<GwToast[]>([]);
  readonly position = signal<GwToastPosition>('top-right');

  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Convenience helpers. */
  info(title: string, options?: GwToastOptions)    { return this.show('info',    title, options); }
  success(title: string, options?: GwToastOptions) { return this.show('success', title, options); }
  warning(title: string, options?: GwToastOptions) { return this.show('warning', title, options); }
  danger(title: string, options?: GwToastOptions)  { return this.show('danger',  title, options); }
  /** Alias matching the legacy ToastService method name. */
  error(title: string, options?: GwToastOptions)   { return this.danger(title, options); }

  show(variant: GwToastVariant, title: string, options?: GwToastOptions): number {
    const id = this.nextId++;
    const duration = options?.duration ?? 4000;
    const toast: GwToast = {
      id, variant, title,
      description: options?.description,
      duration,
      action: options?.action,
    };
    this.toasts.update(list => [...list, toast]);
    if (duration > 0) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
    }
    return id;
  }

  dismiss(id: number) {
    const t = this.timers.get(id);
    if (t) { clearTimeout(t); this.timers.delete(id); }
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }

  clear() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers.clear();
    this.toasts.set([]);
  }
}
