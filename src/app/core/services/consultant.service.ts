import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface ConsultantAdmission {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number | null;
    gender: string | null;
  } | null;
  bed: { bedNumber: string; ward: { id: string; name: string } | null } | null;
  admittingDoctor: { id: string; firstName: string; lastName: string } | null;
  admissionDate: string;
  admissionDiagnosis: string | null;
  lastVisitedAt: string | null;
  openInstructions: number;
}

export interface ConsultantRound {
  id: string;
  admissionId: string;
  consultant: { id: string; firstName: string; lastName: string; specialization: string | null } | null;
  visitedAt: string;
  roundNotes: string;
  instructionsForRmo: string | null;
  instructionStatus: 'open' | 'done' | 'cancelled';
  instructionCompletedAt: string | null;
  instructionCompletedBy: string | null;
  instructionCompletedNotes: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultantService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/consultant`;

  myAdmissions(showAll = false) {
    const url = showAll ? `${this.api}/admissions?showAll=true` : `${this.api}/admissions`;
    return this.http.get<ApiResponse<ConsultantAdmission[]>>(url).pipe(map(r => r.data));
  }

  listForAdmission(admissionId: string) {
    return this.http.get<ApiResponse<ConsultantRound[]>>(`${this.api}/round/admission/${admissionId}`)
      .pipe(map(r => r.data));
  }

  createRound(body: { admissionId: string; roundNotes: string; instructionsForRmo?: string; visitedAt?: string }) {
    return this.http.post<ApiResponse<ConsultantRound>>(`${this.api}/round`, body).pipe(map(r => r.data));
  }

  cancelInstruction(id: string) {
    return this.http.patch<ApiResponse<ConsultantRound>>(`${this.api}/round/${id}/cancel-instruction`, {})
      .pipe(map(r => r.data));
  }
}
