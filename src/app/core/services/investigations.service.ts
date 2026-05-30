import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export type InvestigationDepartment = 'pathology' | 'xray' | 'ct_scan' | 'cathlab' | 'mri';
export type InvestigationStatus = 'ordered' | 'sample_collected' | 'in_progress' | 'reported' | 'billed' | 'cancelled';
export type InvestigationUrgency = 'routine' | 'urgent' | 'stat';
export type BillingClearanceStatus = 'pending' | 'cleared';

export interface InvestigationOrderItem {
  id: string;
  testName: string;
  result?: string;
  unit?: string;
  normalRange?: string;
  isAbnormal: boolean;
  remarks?: string;
  amount: number;
}

export interface InvestigationOrder {
  id: string;
  orderNumber: string;
  clinicId: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string; phone?: string };
  admissionId?: string;
  appointmentId?: string;
  orderedById: string;
  orderedBy?: { id: string; firstName: string; lastName: string; role: string };
  departmentType: InvestigationDepartment;
  clinicalIndication: string;
  urgency: InvestigationUrgency;
  expectedReportAt?: string;
  assignedToUserId?: string;
  acceptedById?: string;
  acceptedBy?: { id: string; firstName: string; lastName: string };
  acceptedAt?: string;
  status: InvestigationStatus;
  reportedById?: string;
  reportedBy?: { id: string; firstName: string; lastName: string };
  reportedAt?: string;
  reportFileUrl?: string;
  reportNotes?: string;
  procedureType?: string;
  referralDoctorId?: string;
  referralDoctor?: { id: string; firstName: string; lastName: string };
  totalAmount: number;
  hospitalPayable: number;
  customerPayable: number;
  insurancePayable: number;
  billingStatus: BillingClearanceStatus;
  billingClearedAt?: string;
  invoiceItemId?: string;
  insuranceClaimId?: string;
  items: InvestigationOrderItem[];
  createdAt: string;
}

export interface InvestigationCatalogItem {
  id: string;
  name: string;
  departmentType: InvestigationDepartment;
  defaultAmount: number;
  turnaroundHours: number;
}

export interface CreateInvestigationOrderPayload {
  patientId: string;
  admissionId?: string;
  appointmentId?: string;
  departmentType: InvestigationDepartment;
  clinicalIndication: string;
  urgency?: InvestigationUrgency;
  expectedReportAt?: string;
  assignedToUserId?: string;
  items?: { testName: string; amount?: number }[];
  procedureType?: string;
  referralDoctorId?: string;
}

export interface ReportPayload {
  items?: { itemId: string; result?: string; isAbnormal?: boolean; remarks?: string }[];
  newItems?: { testName: string; result?: string; unit?: string; normalRange?: string; isAbnormal?: boolean; remarks?: string }[];
  reportFileUrl?: string;
  reportNotes?: string;
}

export interface BillingClearancePayload {
  totalAmount: number;
  hospitalPayable: number;
  customerPayable: number;
  insurancePayable: number;
  insuranceProviderId?: string;
  policyNumber?: string;
  memberName?: string;
  billingNotes?: string;
}

@Injectable({ providedIn: 'root' })
export class InvestigationsService {
  private readonly base = `${environment.apiUrl}/investigations`;

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<ApiResponse<{
      stats: { pending: number; orderedToday: number; inProgressToday: number; reportedToday: number; billedToday: number };
      recentHistory: InvestigationOrder[];
    }>>(`${this.base}/stats`);
  }

  getOrders(params?: Record<string, string>) {
    return this.http.get<PaginatedResponse<InvestigationOrder>>(`${this.base}/orders`, { params: this.toParams(params) });
  }

  getMyQueue() {
    return this.http.get<PaginatedResponse<InvestigationOrder>>(`${this.base}/orders/my-queue`);
  }

  getForPatient(patientId: string) {
    return this.http.get<ApiResponse<InvestigationOrder[]>>(`${this.base}/orders/patient/${patientId}`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<InvestigationOrder>>(`${this.base}/orders/${id}`);
  }

  createOrder(payload: CreateInvestigationOrderPayload) {
    return this.http.post<ApiResponse<InvestigationOrder>>(`${this.base}/orders`, payload);
  }

  acceptOrder(id: string) {
    return this.http.patch<ApiResponse<InvestigationOrder>>(`${this.base}/orders/${id}/accept`, {});
  }

  collectSample(id: string) {
    return this.http.patch<ApiResponse<InvestigationOrder>>(`${this.base}/orders/${id}/collect-sample`, {});
  }

  uploadReportFile(orderId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<{ fileUrl: string }>>(
      `${this.base}/orders/${orderId}/upload-report`, form,
    );
  }

  submitReport(id: string, payload: ReportPayload) {
    return this.http.patch<ApiResponse<InvestigationOrder>>(`${this.base}/orders/${id}/report`, payload);
  }

  setBillingClearance(id: string, payload: BillingClearancePayload) {
    return this.http.patch<ApiResponse<InvestigationOrder>>(`${this.base}/orders/${id}/billing`, payload);
  }

  cancelOrder(id: string) {
    return this.http.patch<ApiResponse<InvestigationOrder>>(`${this.base}/orders/${id}/cancel`, {});
  }

  getCatalog(departmentType?: InvestigationDepartment) {
    const params = departmentType ? this.toParams({ departmentType }) : undefined;
    return this.http.get<ApiResponse<InvestigationCatalogItem[]>>(`${this.base}/catalog`, { params });
  }

  private toParams(obj?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }
}
