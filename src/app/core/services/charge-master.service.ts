import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  headUserId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChargeMaster {
  id: string;
  clinicId: string;
  name: string;
  code: string;
  category: string;
  unit?: string;
  basePrice: number;
  gstRate: number;
  departmentId?: string;
  effectiveFrom: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChargeMasterAudit {
  id: string;
  chargeMasterId: string;
  changedByName: string;
  before: any;
  after: any;
  action: string;
  changedAt: string;
}

export const CHARGE_CATEGORIES = ['room', 'ot', 'investigation', 'medicine', 'service', 'consultation', 'procedure', 'other'];

/** Lightweight, active-only catalog item returned by /charge-master/lookup (for pricing pickers). */
export interface ChargeMasterLookupItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit?: string | null;
  basePrice: number;
  gstRate: number;
}

@Injectable({ providedIn: 'root' })
export class ChargeMasterService {
  private readonly api = `${environment.apiUrl}/charge-master`;

  constructor(private http: HttpClient) {}

  // Departments
  listDepartments() {
    return this.http.get<ApiResponse<Department[]>>(`${this.api}/departments`).pipe(map(r => r.data));
  }
  createDepartment(body: Partial<Department>) {
    return this.http.post<ApiResponse<Department>>(`${this.api}/departments`, body).pipe(map(r => r.data));
  }
  updateDepartment(id: string, body: Partial<Department>) {
    return this.http.put<ApiResponse<Department>>(`${this.api}/departments/${id}`, body).pipe(map(r => r.data));
  }
  deleteDepartment(id: string) {
    return this.http.delete<void>(`${this.api}/departments/${id}`);
  }

  // Charge Master
  list(category?: string) {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<ChargeMaster[]>>(this.api, { params }).pipe(map(r => r.data));
  }
  /** Active-only catalog for charge-entry / billing pickers (clinical + billing roles). */
  lookup(category?: string) {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<ChargeMasterLookupItem[]>>(`${this.api}/lookup`, { params }).pipe(map(r => r.data));
  }
  create(body: Partial<ChargeMaster>) {
    return this.http.post<ApiResponse<ChargeMaster>>(this.api, body).pipe(map(r => r.data));
  }
  update(id: string, body: Partial<ChargeMaster>) {
    return this.http.put<ApiResponse<ChargeMaster>>(`${this.api}/${id}`, body).pipe(map(r => r.data));
  }
  remove(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
  getAuditLog(id: string) {
    return this.http.get<ApiResponse<ChargeMasterAudit[]>>(`${this.api}/${id}/audit`).pipe(map(r => r.data));
  }
}
