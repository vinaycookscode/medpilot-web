import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { Branch } from '../models/branch.models';

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly api = `${environment.apiUrl}/clinics/me/branches`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ApiResponse<Branch[]>>(this.api);
  }

  create(payload: Partial<Branch>) {
    return this.http.post<ApiResponse<Branch>>(this.api, payload);
  }

  update(id: string, payload: Partial<Branch>) {
    return this.http.patch<ApiResponse<Branch>>(`${this.api}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
