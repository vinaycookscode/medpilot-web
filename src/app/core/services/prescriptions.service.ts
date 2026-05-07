import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { Prescription, CreatePrescriptionDto, Medicine } from '../models/prescription.models';

@Injectable({ providedIn: 'root' })
export class PrescriptionsService {
  private readonly api = `${environment.apiUrl}/prescriptions`;

  constructor(private http: HttpClient) {}

  list(params: { page?: number; limit?: number; patientId?: string } = {}) {
    let p = new HttpParams();
    if (params.page)      p = p.set('page', params.page);
    if (params.limit)     p = p.set('limit', params.limit);
    if (params.patientId) p = p.set('patientId', params.patientId);
    return this.http.get<PaginatedResponse<Prescription>>(this.api, { params: p });
  }

  get(id: string) {
    return this.http.get<ApiResponse<Prescription>>(`${this.api}/${id}`);
  }

  create(body: CreatePrescriptionDto) {
    return this.http.post<ApiResponse<Prescription>>(this.api, body);
  }

  update(id: string, body: Partial<CreatePrescriptionDto>) {
    return this.http.put<ApiResponse<Prescription>>(`${this.api}/${id}`, body);
  }

  searchMedicines(q: string) {
    const params = new HttpParams().set('q', q);
    return this.http.get<ApiResponse<Medicine[]>>(`${this.api}/medicines/search`, { params });
  }

  suggestDiagnoses(q: string) {
    const params = new HttpParams().set('q', q);
    return this.http.get<ApiResponse<string[]>>(`${this.api}/diagnoses/suggest`, { params });
  }

  getFollowups(days = 60) {
    const params = new HttpParams().set('days', days);
    return this.http.get<{ data: { overdue: any[]; today: any[]; upcoming: any[] } }>(
      `${this.api}/followups`, { params }
    );
  }

  suggestTests(q: string) {
    const params = new HttpParams().set('q', q);
    return this.http.get<ApiResponse<string[]>>(`${this.api}/tests/suggest`, { params });
  }
}
