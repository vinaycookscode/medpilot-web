import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface RmoOpenInstruction {
  id: string;
  instruction: string;
  from: string;
  createdAt: string;
}

export interface RmoActiveAdmission {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientCode: string | null;
    age: number | null;
    gender: string | null;
  } | null;
  bed: { id: string; bedNumber: string; ward: { id: string; name: string } | null } | null;
  admittingDoctor: { id: string; firstName: string; lastName: string; specialization: string | null } | null;
  admissionDate: string;
  admissionDiagnosis: string | null;
  openInstructions: RmoOpenInstruction[];
}

export interface RmoLite {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface RmoHandover {
  id: string;
  admissionId: string;
  patient: { id: string; firstName: string; lastName: string } | null;
  bed: { bedNumber: string; ward: { id: string; name: string } | null } | null;
  outgoingRmo: { id: string; firstName: string; lastName: string } | null;
  incomingRmo: { id: string; firstName: string; lastName: string } | null;
  handoverNotes: string;
  pendingTasks: Record<string, any> | null;
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedNotes: string | null;
}

export interface RmoHandoverItem {
  admissionId: string;
  handoverNotes: string;
  pendingTasks?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class RmoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/rmo`;

  activeAdmissions() {
    return this.http.get<ApiResponse<RmoActiveAdmission[]>>(`${this.api}/admissions/active`)
      .pipe(map(r => r.data));
  }

  rmos() {
    return this.http.get<ApiResponse<RmoLite[]>>(`${this.api}/rmos`).pipe(map(r => r.data));
  }

  createHandover(body: { incomingRmoId: string; items: RmoHandoverItem[] }) {
    return this.http.post<ApiResponse<{ count: number; items: string[] }>>(`${this.api}/handover`, body)
      .pipe(map(r => r.data));
  }

  listPending() {
    return this.http.get<ApiResponse<RmoHandover[]>>(`${this.api}/handover/pending`).pipe(map(r => r.data));
  }

  acknowledge(id: string, acknowledgedNotes?: string) {
    return this.http.patch<ApiResponse<RmoHandover>>(`${this.api}/handover/${id}/acknowledge`, { acknowledgedNotes })
      .pipe(map(r => r.data));
  }

  listAuditLog(params: { pending?: 'true' | 'false'; page?: number; limit?: number } = {}) {
    let p = new HttpParams();
    if (params.pending) p = p.set('pending', params.pending);
    if (params.page)    p = p.set('page', String(params.page));
    if (params.limit)   p = p.set('limit', String(params.limit));
    return this.http.get<PaginatedResponse<RmoHandover>>(`${this.api}/handover`, { params: p });
  }

  completeInstruction(instructionId: string, notes?: string) {
    return this.http.patch<ApiResponse<any>>(`${this.api}/instruction/${instructionId}/complete`, { notes })
      .pipe(map(r => r.data));
  }

  // ── RMO → Nursing orders ────────────────────────────────
  createOrder(body: { admissionId: string; instruction: string; assignedNurseId?: string; relatedConsultantInstructionId?: string }) {
    return this.http.post<ApiResponse<RmoOrder>>(`${this.api}/order`, body).pipe(map(r => r.data));
  }
}

export interface RmoOrder {
  id: string;
  admissionId: string;
  patient: { id: string; firstName: string; lastName: string } | null;
  bed: { bedNumber: string; ward: { id: string; name: string } | null } | null;
  rmo: { id: string; firstName: string; lastName: string } | null;
  assignedNurseId: string | null;
  relatedConsultantInstructionId: string | null;
  instruction: string;
  status: 'open' | 'done' | 'cancelled';
  completedAt: string | null;
  completedBy: string | null;
  completedNotes: string | null;
  createdAt: string;
}
