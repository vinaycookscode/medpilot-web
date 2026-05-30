import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export type PharmacyType = 'in_house' | 'out_house';
export type PharmacyOrderStatus = 'pending' | 'dispensing' | 'dispensed' | 'cancelled';
export type PharmacyBillingStatus = 'pending' | 'billed' | 'cleared';

export interface PharmacyOrderItem {
  id: string;
  medicineName: string;
  strength?: string;
  form?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribedQty: number;
  dispensedQty: number;
  unitPrice: number;
  totalPrice: number;
  isBillable: boolean;
  prescriptionMedicineId?: string;
}

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string; phone?: string };
  admissionId?: string;
  prescriptionId?: string;
  pharmacyType: PharmacyType;
  status: PharmacyOrderStatus;
  dispensedById?: string;
  dispensedBy?: { id: string; firstName: string; lastName: string };
  dispensedAt?: string;
  totalAmount: number;
  billingStatus: PharmacyBillingStatus;
  invoiceItemId?: string;
  pharmacistClearedById?: string;
  pharmacistClearedAt?: string;
  notes?: string;
  items: PharmacyOrderItem[];
  createdAt: string;
}

export interface PendingPrescription {
  id: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; firstName: string; lastName: string };
  diagnosis: string;
  medicines: {
    id: string; medicineName: string; dosage: string;
    frequency: string; duration: string; strength?: string; form?: string;
  }[];
  createdAt: string;
}

export interface CreatePharmacyOrderPayload {
  patientId: string;
  admissionId?: string;
  prescriptionId?: string;
  pharmacyType: PharmacyType;
  items: {
    prescriptionMedicineId?: string;
    medicineName: string;
    strength?: string;
    form?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    prescribedQty?: number;
    isBillable?: boolean;
  }[];
  notes?: string;
}

export interface DispensePayload {
  items: { itemId: string; dispensedQty: number; unitPrice: number }[];
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private readonly base = `${environment.apiUrl}/pharmacy`;

  constructor(private http: HttpClient) {}

  getPendingPrescriptions() {
    return this.http.get<ApiResponse<PendingPrescription[]>>(`${this.base}/orders/pending-prescriptions`);
  }

  createOrder(payload: CreatePharmacyOrderPayload) {
    return this.http.post<ApiResponse<PharmacyOrder>>(`${this.base}/orders`, payload);
  }

  getOrders(params?: Record<string, string>) {
    return this.http.get<PaginatedResponse<PharmacyOrder>>(`${this.base}/orders`, { params: this.toParams(params) });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<PharmacyOrder>>(`${this.base}/orders/${id}`);
  }

  dispense(id: string, payload: DispensePayload) {
    return this.http.patch<ApiResponse<PharmacyOrder>>(`${this.base}/orders/${id}/dispense`, payload);
  }

  bill(id: string) {
    return this.http.patch<ApiResponse<PharmacyOrder>>(`${this.base}/orders/${id}/bill`, {});
  }

  clearOutbound(id: string) {
    return this.http.patch<ApiResponse<PharmacyOrder>>(`${this.base}/orders/${id}/clear-outbound`, {});
  }

  cancelOrder(id: string) {
    return this.http.patch<ApiResponse<PharmacyOrder>>(`${this.base}/orders/${id}/cancel`, {});
  }

  private toParams(obj?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }
}
