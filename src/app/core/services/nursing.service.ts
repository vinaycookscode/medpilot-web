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

  // ── RMO → Nursing orders inbox (hits the /rmo module's endpoints) ──
  listRmoOrders() {
    const base = `${environment.apiUrl}/rmo`;
    return this.http.get<ApiResponse<RmoOrderForNursing[]>>(`${base}/order/for-nursing`).pipe(map(r => r.data));
  }

  completeRmoOrder(id: string, notes?: string) {
    const base = `${environment.apiUrl}/rmo`;
    return this.http.patch<ApiResponse<RmoOrderForNursing>>(`${base}/order/${id}/complete`, { notes })
      .pipe(map(r => r.data));
  }

  // ── Nursing → Attendant tasks ──
  createTask(body: {
    admissionId: string;
    category: string;
    title: string;
    description?: string;
    dueAt?: string;
    destination?: string;
    assignedAttendantId?: string;
    relatedRmoOrderId?: string;
  }) {
    return this.http.post<ApiResponse<NursingTask>>(`${this.api}/task`, body).pipe(map(r => r.data));
  }

  attendants() {
    return this.http.get<ApiResponse<AttendantLite[]>>(`${this.api}/attendants`).pipe(map(r => r.data));
  }

  myOpenTasks() {
    return this.http.get<ApiResponse<NursingTask[]>>(`${this.api}/task/mine`).pipe(map(r => r.data));
  }

  tasksForAttendant() {
    return this.http.get<ApiResponse<NursingTask[]>>(`${this.api}/task/for-attendant`).pipe(map(r => r.data));
  }

  completeTask(id: string, notes?: string) {
    return this.http.patch<ApiResponse<NursingTask>>(`${this.api}/task/${id}/complete`, { notes }).pipe(map(r => r.data));
  }

  cancelTask(id: string) {
    return this.http.patch<ApiResponse<NursingTask>>(`${this.api}/task/${id}/cancel`, {}).pipe(map(r => r.data));
  }
}

export interface RmoOrderForNursing {
  id: string;
  admissionId: string;
  patient: { id: string; firstName: string; lastName: string } | null;
  bed: { bedNumber: string; ward: { id: string; name: string } | null } | null;
  rmo: { id: string; firstName: string; lastName: string } | null;
  assignedNurseId: string | null;
  relatedConsultantInstructionId: string | null;
  instruction: string;
  status: 'open' | 'done' | 'cancelled';
  createdAt: string;
}

// ── Nursing → Attendant tasks ──
export interface AttendantLite {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface NursingTask {
  id: string;
  admissionId: string;
  patient: { id: string; firstName: string; lastName: string } | null;
  bed: { bedNumber: string; ward: { id: string; name: string } | null } | null;
  nurse: { id: string; firstName: string; lastName: string } | null;
  assignedAttendant: { id: string; firstName: string; lastName: string } | null;
  category: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  destination: string | null;
  status: 'open' | 'done' | 'cancelled';
  relatedRmoOrderId: string | null;
  createdAt: string;
  completedAt: string | null;
  completedBy: string | null;
  completedNotes: string | null;
}
