import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface NabhItem {
  id: string;
  department: string;
  task: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  shift: 'morning' | 'evening' | 'night' | 'all';
  displayOrder: number;
  escalateTo?: string;
  isActive: boolean;
}

export interface NabhDailyRow {
  item: NabhItem;
  shiftStatuses: Array<{
    shift: string;
    status: 'pending' | 'completed' | 'missed' | 'escalated';
    completedByName: string | null;
    completedAt: string | null;
    notes: string | null;
    logId: string | null;
  }>;
}

export interface NabhMonthlyReport {
  period: { year: number; month: number };
  summary: { total: number; completed: number; missed: number; pending: number; escalated: number };
  complianceRate: number;
  byDepartment: Array<{ department: string; total: number; completed: number; rate: number }>;
}

@Injectable({ providedIn: 'root' })
export class NabhService {
  private readonly api = `${environment.apiUrl}/nabh`;

  constructor(private http: HttpClient) {}

  listItems(department?: string) {
    let params = new HttpParams();
    if (department) params = params.set('department', department);
    return this.http.get<ApiResponse<NabhItem[]>>(`${this.api}/items`, { params }).pipe(map(r => r.data));
  }
  createItem(body: Partial<NabhItem>) {
    return this.http.post<ApiResponse<NabhItem>>(`${this.api}/items`, body).pipe(map(r => r.data));
  }
  updateItem(id: string, body: Partial<NabhItem>) {
    return this.http.put<ApiResponse<NabhItem>>(`${this.api}/items/${id}`, body).pipe(map(r => r.data));
  }
  deleteItem(id: string) {
    return this.http.delete<void>(`${this.api}/items/${id}`);
  }
  getDepartments() {
    return this.http.get<ApiResponse<string[]>>(`${this.api}/departments`).pipe(map(r => r.data));
  }
  getDailyStatus(date?: string) {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<NabhDailyRow[]>>(`${this.api}/daily`, { params }).pipe(map(r => r.data));
  }
  logCompletion(body: { checklistItemId: string; date: string; shift: string; status: string; notes?: string }) {
    return this.http.post<ApiResponse<any>>(`${this.api}/log`, body).pipe(map(r => r.data));
  }
  getMonthlyReport(year: number, month: number) {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<ApiResponse<NabhMonthlyReport>>(`${this.api}/report/monthly`, { params }).pipe(map(r => r.data));
  }
}
