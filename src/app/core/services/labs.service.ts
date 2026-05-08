import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface LabTest {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  turnaroundDays: number;
  description?: string;
}

export interface LabOrderItem {
  testId: string;
  testName: string;
  price: number;
  result?: string;
  referenceRange?: string;
  unit?: string;
  isAbnormal?: boolean;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  doctorName?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: LabOrderItem[];
  totalAmount: number;
  notes?: string;
  collectedAt?: string;
  completedAt?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LabsService {
  private readonly base = `${environment.apiUrl}/labs`;

  constructor(private http: HttpClient) {}

  getOrders(params?: Record<string, string>) {
    return this.http.get<ApiResponse<LabOrder[]>>(`${this.base}/orders`, { params: this.toParams(params) });
  }

  createOrder(data: Partial<LabOrder>) {
    return this.http.post<ApiResponse<LabOrder>>(`${this.base}/orders`, data);
  }

  updateResults(id: string, data: { items: Partial<LabOrderItem>[]; status: string }) {
    return this.http.patch<ApiResponse<LabOrder>>(`${this.base}/orders/${id}/results`, data);
  }

  cancelOrder(id: string) {
    return this.http.patch<ApiResponse<LabOrder>>(`${this.base}/orders/${id}/cancel`, {});
  }

  getTestCatalog() {
    return this.http.get<ApiResponse<LabTest[]>>(`${this.base}/tests`);
  }

  private toParams(obj?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }
}
