import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class ChargeMasterService {
  private readonly api = `${environment.apiUrl}/charge-master`;

  constructor(private http: HttpClient) {}

  // Departments
  listDepartments() {
    return this.http.get<Department[]>(`${this.api}/departments`);
  }
  createDepartment(body: Partial<Department>) {
    return this.http.post<Department>(`${this.api}/departments`, body);
  }
  updateDepartment(id: string, body: Partial<Department>) {
    return this.http.put<Department>(`${this.api}/departments/${id}`, body);
  }
  deleteDepartment(id: string) {
    return this.http.delete<void>(`${this.api}/departments/${id}`);
  }

  // Charge Master
  list(category?: string) {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<ChargeMaster[]>(this.api, { params });
  }
  create(body: Partial<ChargeMaster>) {
    return this.http.post<ChargeMaster>(this.api, body);
  }
  update(id: string, body: Partial<ChargeMaster>) {
    return this.http.put<ChargeMaster>(`${this.api}/${id}`, body);
  }
  remove(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
  getAuditLog(id: string) {
    return this.http.get<ChargeMasterAudit[]>(`${this.api}/${id}/audit`);
  }
}
