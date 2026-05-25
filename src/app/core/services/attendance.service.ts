import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface AttendanceUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization: string | null;
  avatarUrl: string | null;
}

export interface AttendanceEntry {
  id: string;
  userId: string;
  user: AttendanceUser | null;
  entryAt: string;
  exitAt: string | null;
  bagChecked: boolean;
  recordedBy: string;
  notes: string | null;
}

export interface ComplianceReport {
  date: string;
  perRole: { role: string; total: number; checked: number; percent: number }[];
}

export interface CreateEntryDto {
  userId: string;
  bagChecked: boolean;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/attendance`;

  createEntry(dto: CreateEntryDto) {
    return this.http.post<ApiResponse<AttendanceEntry>>(`${this.api}/entry`, dto).pipe(map(r => r.data));
  }

  markExit(id: string) {
    return this.http.patch<ApiResponse<AttendanceEntry>>(`${this.api}/${id}/exit`, {}).pipe(map(r => r.data));
  }

  listOpen() {
    return this.http.get<ApiResponse<AttendanceEntry[]>>(`${this.api}/open`).pipe(map(r => r.data));
  }

  list(params: { date?: string; role?: string; search?: string; page?: number; limit?: number } = {}) {
    let p = new HttpParams();
    if (params.date)   p = p.set('date', params.date);
    if (params.role)   p = p.set('role', params.role);
    if (params.search) p = p.set('search', params.search);
    if (params.page)   p = p.set('page', String(params.page));
    if (params.limit)  p = p.set('limit', String(params.limit));
    // TransformInterceptor lifts {data, meta} to top level — so the full
    // response is PaginatedResponse, NOT ApiResponse<{data,meta}>.
    return this.http.get<PaginatedResponse<AttendanceEntry>>(this.api, { params: p });
  }

  compliance(date?: string) {
    let p = new HttpParams();
    if (date) p = p.set('date', date);
    return this.http.get<ApiResponse<ComplianceReport>>(`${this.api}/compliance`, { params: p }).pipe(map(r => r.data));
  }

  searchStaff(q: string) {
    return this.http
      .get<ApiResponse<AttendanceUser[]>>(`${this.api}/staff-search`, { params: new HttpParams().set('q', q) })
      .pipe(map(r => r.data));
  }
}
