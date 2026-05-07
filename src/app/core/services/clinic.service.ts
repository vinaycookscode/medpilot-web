import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { shareReplay } from 'rxjs';

export interface ClinicDetail {
  id: string;
  name: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  gstRegistered: boolean;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private readonly api = `${environment.apiUrl}/clinics`;
  private me$: ReturnType<HttpClient['get']> | null = null;

  constructor(private http: HttpClient) {}

  getMe() {
    if (!this.me$) {
      this.me$ = this.http.get<ApiResponse<ClinicDetail>>(`${this.api}/me`).pipe(shareReplay(1));
    }
    return this.me$ as ReturnType<typeof this.http.get<ApiResponse<ClinicDetail>>>;
  }
}
