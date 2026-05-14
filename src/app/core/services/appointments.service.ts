import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { Appointment, CreateAppointmentDto, AvailableSlot, AppointmentStatus } from '../models/appointment.models';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly api = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  listToday(page = 1, limit = 20, date?: string) {
    const d = new Date();
    const todayDate = date ?? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let params = new HttpParams().set('date', todayDate).set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<Appointment>>(`${this.api}/today`, { params });
  }

  calendar(startDate: string, endDate: string) {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<ApiResponse<Appointment[]>>(`${this.api}/calendar`, { params });
  }

  list(params: { patientId?: string; doctorId?: string; date?: string; status?: AppointmentStatus; page?: number } = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) p = p.set(k, v); });
    return this.http.get<PaginatedResponse<Appointment>>(this.api, { params: p });
  }

  get(id: string) {
    return this.http.get<ApiResponse<Appointment>>(`${this.api}/${id}`);
  }

  create(body: CreateAppointmentDto) {
    return this.http.post<ApiResponse<Appointment>>(this.api, body);
  }

  updateStatus(id: string, status: AppointmentStatus, cancelledReason?: string) {
    return this.http.patch<ApiResponse<Appointment>>(`${this.api}/${id}/status`, { status, cancelledReason });
  }

  getAvailableSlots(doctorId: string, date: string) {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<AvailableSlot[]>>(`${environment.apiUrl}/doctors/${doctorId}/available-slots`, { params });
  }
}
