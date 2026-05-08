import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { DoctorSchedule, ScheduleOverride, TimeSlot } from '../models/schedule.models';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly api = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  getSchedule(doctorId: string) {
    return this.http.get<ApiResponse<DoctorSchedule[]>>(`${this.api}/${doctorId}/schedule`);
  }

  setSchedule(doctorId: string, payload: Partial<DoctorSchedule>) {
    return this.http.post<ApiResponse<DoctorSchedule>>(`${this.api}/${doctorId}/schedule`, payload);
  }

  addOverride(doctorId: string, payload: Partial<ScheduleOverride>) {
    return this.http.post<ApiResponse<ScheduleOverride>>(`${this.api}/${doctorId}/schedule/override`, payload);
  }

  getAvailableSlots(doctorId: string, date: string) {
    return this.http.get<ApiResponse<TimeSlot[]>>(`${this.api}/${doctorId}/available-slots`, { params: { date } });
  }
}
