import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface ActiveAdmission {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientCode: string | null;
    age: number | null;
    gender: string | null;
  } | null;
  bed: {
    id: string;
    bedNumber: string;
    ward: { id: string; name: string } | null;
  } | null;
  admissionDate: string;
  admissionDiagnosis: string | null;
  condition: string | null;
}

export interface NurseLite {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface Handover {
  id: string;
  admissionId: string;
  patient: { id: string; firstName: string; lastName: string } | null;
  bed: { bedNumber: string; ward: { id: string; name: string } | null } | null;
  outgoingNurse: { id: string; firstName: string; lastName: string } | null;
  incomingNurse: { id: string; firstName: string; lastName: string } | null;
  handoverNotes: string;
  pendingTasks: Record<string, any> | null;
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedNotes: string | null;
}

export interface HandoverItem {
  admissionId: string;
  handoverNotes: string;
  pendingTasks?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class NursingService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/nursing`;

  activeAdmissions() {
    return this.http.get<ApiResponse<ActiveAdmission[]>>(`${this.api}/admissions/active`)
      .pipe(map(r => r.data));
  }

  nurses() {
    return this.http.get<ApiResponse<NurseLite[]>>(`${this.api}/nurses`).pipe(map(r => r.data));
  }

  createHandover(body: { incomingNurseId: string; items: HandoverItem[] }) {
    return this.http.post<ApiResponse<{ count: number; items: string[] }>>(`${this.api}/handover`, body)
      .pipe(map(r => r.data));
  }

  listPending() {
    return this.http.get<ApiResponse<Handover[]>>(`${this.api}/handover/pending`).pipe(map(r => r.data));
  }

  acknowledge(id: string, acknowledgedNotes?: string) {
    return this.http.patch<ApiResponse<Handover>>(`${this.api}/handover/${id}/acknowledge`, { acknowledgedNotes })
      .pipe(map(r => r.data));
  }

  listAuditLog(params: { from?: string; to?: string; pending?: 'true' | 'false'; page?: number; limit?: number } = {}) {
    let p = new HttpParams();
    if (params.from)    p = p.set('from', params.from);
    if (params.to)      p = p.set('to', params.to);
    if (params.pending) p = p.set('pending', params.pending);
    if (params.page)    p = p.set('page', String(params.page));
    if (params.limit)   p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<Handover>>(`${this.api}/handover`, { params: p });
  }
}
