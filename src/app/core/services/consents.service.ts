import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface AbhaConsent {
  id: string;
  clinicId: string;
  consentRequestId: string;
  artefactId: string | null;
  patientAbha: string;
  hiuId: string;
  hiuName: string | null;
  purposeCode: string;
  purposeText: string | null;
  hiTypes: string[];
  dateRangeFrom: string | null;
  dateRangeTo: string | null;
  dataEraseAt: string | null;
  status: 'REQUESTED' | 'GRANTED' | 'REVOKED' | 'EXPIRED';
  isFlagged: boolean;
  flaggedAt: string | null;
  grantedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ConsentSummary {
  REQUESTED: number;
  GRANTED: number;
  REVOKED: number;
  EXPIRED: number;
}

@Injectable({ providedIn: 'root' })
export class ConsentsService {
  private readonly base = `${environment.apiUrl}/abdm/consents`;

  constructor(private http: HttpClient) {}

  list(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    return this.http.get<ApiResponse<AbhaConsent[]>>(this.base, { params: this.toParams(params) });
  }

  summary() {
    return this.http.get<ApiResponse<ConsentSummary>>(`${this.base}/summary`);
  }

  get(id: string) {
    return this.http.get<ApiResponse<AbhaConsent>>(`${this.base}/${id}`);
  }

  flag(id: string) {
    return this.http.patch<ApiResponse<AbhaConsent>>(`${this.base}/${id}/flag`, {});
  }

  private toParams(obj?: Record<string, any>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v)); });
    return p;
  }
}
