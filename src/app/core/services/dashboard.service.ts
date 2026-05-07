import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { DashboardSummary, RevenueData, AppointmentStatusCount, PatientStats, DoctorStats } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.api}/summary`);
  }

  getRevenue(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    const params = new HttpParams().set('period', period);
    return this.http.get<ApiResponse<RevenueData>>(`${this.api}/revenue`, { params });
  }

  getAppointmentStats() {
    return this.http.get<ApiResponse<AppointmentStatusCount[]>>(`${this.api}/appointments/stats`);
  }

  getPatientStats() {
    return this.http.get<ApiResponse<PatientStats>>(`${this.api}/patients/stats`);
  }

  getDoctorStats() {
    return this.http.get<ApiResponse<DoctorStats[]>>(`${this.api}/doctors/stats`);
  }
}
