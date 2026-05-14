import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  diagnoses?: string;
  notes?: string;
  submittedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  private readonly base = `${environment.apiUrl}/insurance`;

  constructor(private http: HttpClient) {}

  getProviders() {
    return this.http.get<ApiResponse<InsuranceProvider[]>>(`${this.base}/providers`);
  }

  createProvider(data: Partial<InsuranceProvider>) {
    return this.http.post<ApiResponse<InsuranceProvider>>(`${this.base}/providers`, data);
  }

  getClaims(params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC' } & Record<string, any>) {
    return this.http.get<PaginatedResponse<InsuranceClaim>>(`${this.base}/claims`, { params: this.toParams(params) });
  }

  createClaim(data: Partial<InsuranceClaim>) {
    return this.http.post<ApiResponse<InsuranceClaim>>(`${this.base}/claims`, data);
  }

  updateClaim(id: string, data: Partial<InsuranceClaim>) {
    return this.http.patch<ApiResponse<InsuranceClaim>>(`${this.base}/claims/${id}`, data);
  }

  getClaimStats() {
    return this.http.get<ApiResponse<any>>(`${this.base}/claims/stats`);
  }

  private toParams(obj?: Record<string, any>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v != null && v !== '') p = p.set(k, String(v)); });
    return p;
  }
}
