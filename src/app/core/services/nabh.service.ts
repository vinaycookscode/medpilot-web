import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    return this.http.get<NabhItem[]>(`${this.api}/items`, { params });
  }
  createItem(body: Partial<NabhItem>) {
    return this.http.post<NabhItem>(`${this.api}/items`, body);
  }
  updateItem(id: string, body: Partial<NabhItem>) {
    return this.http.put<NabhItem>(`${this.api}/items/${id}`, body);
  }
  deleteItem(id: string) {
    return this.http.delete<void>(`${this.api}/items/${id}`);
  }
  getDepartments() {
    return this.http.get<string[]>(`${this.api}/departments`);
  }
  getDailyStatus(date?: string) {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<NabhDailyRow[]>(`${this.api}/daily`, { params });
  }
  logCompletion(body: { checklistItemId: string; date: string; shift: string; status: string; notes?: string }) {
    return this.http.post<any>(`${this.api}/log`, body);
  }
  getMonthlyReport(year: number, month: number) {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<NabhMonthlyReport>(`${this.api}/report/monthly`, { params });
  }
}
