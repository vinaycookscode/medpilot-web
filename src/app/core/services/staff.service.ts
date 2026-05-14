import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialization?: string;
  qualification?: string;
  isActive: boolean;
  branchId?: string;
  consultationFee?: number;
}

export interface StaffLeave {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  user?: Staff;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getStaff(params?: Record<string, string>) {
    return this.http.get<ApiResponse<Staff[]>>(`${this.api}/users`, { params });
  }

  createStaff(data: {
    email: string; password: string; role: string;
    firstName: string; lastName: string; phone?: string;
    specialization?: string; qualification?: string;
    registrationNo?: string; consultationFee?: number;
  }) {
    return this.http.post<ApiResponse<Staff>>(`${this.api}/users`, data);
  }

  getDoctors() {
    return this.http.get<ApiResponse<Staff[]>>(`${this.api}/staff`, { params: { role: 'doctor' } });
  }

  getStaffById(id: string) {
    return this.http.get<ApiResponse<Staff>>(`${this.api}/users/${id}`);
  }

  updateStaff(id: string, data: Partial<Staff>) {
    return this.http.patch<ApiResponse<Staff>>(`${this.api}/users/${id}`, data);
  }

  createLeave(data: Partial<StaffLeave>) {
    return this.http.post<ApiResponse<StaffLeave>>(`${this.api}/staff/leaves`, data);
  }

  getLeaves(params?: Record<string, string>) {
    return this.http.get<ApiResponse<StaffLeave[]>>(`${this.api}/staff/leaves`, { params });
  }

  updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
    return this.http.patch<ApiResponse<StaffLeave>>(`${this.api}/staff/leaves/${id}/status`, { status });
  }
}
