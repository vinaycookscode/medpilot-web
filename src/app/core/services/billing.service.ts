import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { Invoice, Service } from '../models/billing.models';

export interface CreateInvoiceItem {
  serviceId?: string;
  description: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
  gstRate?: number;
}

export interface CreateInvoiceDto {
  patientId: string;
  appointmentId?: string;
  items: CreateInvoiceItem[];
  notes?: string;
  isInterState?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly invoicesApi = `${environment.apiUrl}/invoices`;
  private readonly servicesApi = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  listInvoices(params: { patientId?: string; status?: string; page?: number } = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) p = p.set(k, v); });
    return this.http.get<PaginatedResponse<Invoice>>(this.invoicesApi, { params: p });
  }

  pendingInvoices() {
    return this.http.get<ApiResponse<Invoice[]>>(`${this.invoicesApi}/pending`);
  }

  getInvoice(id: string) {
    return this.http.get<ApiResponse<Invoice>>(`${this.invoicesApi}/${id}`);
  }

  createInvoice(body: CreateInvoiceDto) {
    return this.http.post<ApiResponse<Invoice>>(this.invoicesApi, body);
  }

  recordPayment(invoiceId: string, body: { amount: number; method: string; notes?: string }) {
    return this.http.post<ApiResponse<void>>(`${this.invoicesApi}/${invoiceId}/payments`, body);
  }

  listServices() {
    return this.http.get<ApiResponse<Service[]>>(this.servicesApi);
  }
}
