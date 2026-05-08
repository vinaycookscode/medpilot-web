import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(params?: Record<string, string>) {
    return this.http.get<ApiResponse<Notification[]>>(this.api, { params });
  }

  getUnreadCount() {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.api}/unread-count`);
  }

  markRead(id: string) {
    return this.http.patch<ApiResponse<Notification>>(`${this.api}/${id}/read`, {});
  }

  markAllRead() {
    return this.http.patch<ApiResponse<void>>(`${this.api}/read-all`, {});
  }

  deleteNotification(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
