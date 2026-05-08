import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { NotificationsService, Notification } from '../../core/services/notifications.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  private notificationsService = inject(NotificationsService);
  private toast = inject(ToastService);

  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(false);
  readonly filter = signal<'all' | 'unread'>('all');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params = this.filter() === 'unread' ? { isRead: 'false' } : undefined;
    this.notificationsService.getNotifications(params).subscribe({
      next: r => {
        this.notifications.set(r.data ?? []);
        this.loading.set(false);
        this.updateUnreadCount();
      },
      error: () => this.loading.set(false),
    });
  }

  private updateUnreadCount() {
    this.notificationsService.getUnreadCount().subscribe({
      next: r => this.unreadCount.set(r.data?.count ?? 0),
      error: () => {},
    });
  }

  markRead(id: string) {
    this.notificationsService.markRead(id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
      error: () => this.toast.show('Failed to mark as read', 'danger'),
    });
  }

  markAllRead() {
    this.notificationsService.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
        this.toast.show('All notifications marked as read', 'success');
      },
      error: () => this.toast.show('Failed to mark all as read', 'danger'),
    });
  }

  deleteNotif(id: string) {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(n => n.id !== id));
        this.toast.show('Notification deleted', 'success');
      },
      error: () => this.toast.show('Failed to delete notification', 'danger'),
    });
  }

  setFilter(value: 'all' | 'unread') {
    this.filter.set(value);
    this.load();
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'appointment':  return 'calendar';
      case 'billing':      return 'receipt';
      case 'patient':      return 'user-check';
      case 'prescription': return 'file-text';
      case 'alert':        return 'alert-circle';
      case 'system':       return 'info';
      case 'followup':     return 'calendar-check';
      default:             return 'bell';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'appointment':  return 'var(--color-primary)';
      case 'billing':      return 'var(--color-success)';
      case 'patient':      return 'var(--color-teal)';
      case 'prescription': return 'var(--color-purple)';
      case 'alert':        return 'var(--color-danger)';
      case 'followup':     return 'var(--color-warning)';
      default:             return 'var(--text-secondary)';
    }
  }

  getTypeBg(type: string): string {
    switch (type) {
      case 'appointment':  return 'var(--color-primary-subtle)';
      case 'billing':      return 'var(--color-success-subtle)';
      case 'patient':      return 'var(--color-teal-subtle)';
      case 'prescription': return 'var(--color-purple-subtle)';
      case 'alert':        return 'var(--color-danger-subtle)';
      case 'followup':     return 'var(--color-warning-subtle)';
      default:             return 'var(--surface-input)';
    }
  }

  timeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60)   return 'just now';
    if (diffMins < 60)   return `${diffMins}m ago`;
    if (diffHours < 24)  return `${diffHours}h ago`;
    if (diffDays < 7)    return `${diffDays}d ago`;
    return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  get filteredNotifications(): Notification[] {
    if (this.filter() === 'unread') {
      return this.notifications().filter(n => !n.isRead);
    }
    return this.notifications();
  }
}
