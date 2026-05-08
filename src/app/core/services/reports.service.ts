import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getRevenueSummary(params?: Record<string, string>) {
    return this.http.get<ApiResponse<any>>(`${this.base}/revenue`, { params: this.toParams(params) });
  }

  getAppointmentStats(params?: Record<string, string>) {
    return this.http.get<ApiResponse<any>>(`${this.base}/appointments`, { params: this.toParams(params) });
  }

  getPatientStats(params?: Record<string, string>) {
    return this.http.get<ApiResponse<any>>(`${this.base}/patients`, { params: this.toParams(params) });
  }

  getInventoryStats(params?: Record<string, string>) {
    return this.http.get<ApiResponse<any>>(`${this.base}/inventory`, { params: this.toParams(params) });
  }

  private toParams(obj?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }
}
