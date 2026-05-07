import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { Patient, CreatePatientDto, PatientVital } from '../models/patient.models';

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly api = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  list(params: { search?: string; page?: number; limit?: number } = {}) {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.page)   p = p.set('page', params.page);
    if (params.limit)  p = p.set('limit', params.limit);
    return this.http.get<PaginatedResponse<Patient>>(this.api, { params: p });
  }

  get(id: string) {
    return this.http.get<ApiResponse<Patient>>(`${this.api}/${id}`);
  }

  create(body: CreatePatientDto) {
    return this.http.post<ApiResponse<Patient>>(this.api, body);
  }

  update(id: string, body: Partial<CreatePatientDto>) {
    return this.http.put<ApiResponse<Patient>>(`${this.api}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  getVitals(patientId: string) {
    return this.http.get<ApiResponse<PatientVital[]>>(`${this.api}/${patientId}/vitals`);
  }

  addVital(patientId: string, body: Omit<PatientVital, 'id' | 'patientId' | 'recordedAt' | 'recordedById'>) {
    return this.http.post<ApiResponse<PatientVital>>(`${this.api}/${patientId}/vitals`, body);
  }
}
