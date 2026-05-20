import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface AbhaProfile {
  hasAbha: boolean;
  abhaNumber: string | null;
  abhaAddress: string | null;
  verified: boolean;
  kycType: string | null;
  linkedAt: string | null;
}

export interface InitiateOtpResult {
  sessionToken: string;
  message: string;
}

export interface EnrollAbhaResult {
  abhaNumber: string;
  abhaAddress: string | null;
  name: string;
  mobile: string | null;
  gender: string;
  isNew: boolean;
  sessionToken: string;
  suggestions?: string[];
}

export interface VerifyAbhaResult {
  abhaNumber: string;
  abhaAddress: string | null;
  name: string;
  gender: string;
  mobile: string | null;
  isNewPatient: boolean;
  patientId: string | null;
}

export interface CareContext {
  id: string;
  referenceNumber: string;
  display: string;
  sourceType: 'appointment' | 'prescription' | 'lab_order';
  hiTypes: string[];
  status: 'pending' | 'linked' | 'failed';
  retryCount: number;
  linkedAt: string | null;
  lastAttemptAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AbhaService {
  private readonly api = `${environment.apiUrl}/abha`;

  constructor(private http: HttpClient) {}

  getProfile(patientId: string) {
    return this.http.get<ApiResponse<AbhaProfile>>(`${this.api}/patients/${patientId}/profile`);
  }

  initiateCreate(patientId: string, aadhaar: string) {
    return this.http.post<ApiResponse<InitiateOtpResult>>(
      `${this.api}/patients/${patientId}/create/aadhaar/initiate`,
      { aadhaar },
    );
  }

  enrollAbha(sessionToken: string, otp: string, mobile?: string) {
    return this.http.post<ApiResponse<EnrollAbhaResult>>(
      `${this.api}/create/aadhaar/enroll`,
      { sessionToken, otp, ...(mobile ? { mobile } : {}) },
    );
  }

  selectAddress(sessionToken: string, abhaAddress: string) {
    return this.http.post<ApiResponse<{ abhaAddress: string }>>(
      `${this.api}/create/address`,
      { sessionToken, abhaAddress },
    );
  }

  downloadCard(patientId: string) {
    return this.http.get(`${this.api}/patients/${patientId}/card`, { responseType: 'blob' });
  }

  initiateVerifyForPatient(patientId: string, loginId: string, loginHint = 'abha-number') {
    return this.http.post<ApiResponse<InitiateOtpResult>>(
      `${this.api}/patients/${patientId}/verify/initiate`,
      { loginId, loginHint },
    );
  }

  confirmVerify(sessionToken: string, otp: string) {
    return this.http.post<ApiResponse<VerifyAbhaResult>>(
      `${this.api}/verify/confirm`,
      { sessionToken, otp },
    );
  }

  unlink(patientId: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/patients/${patientId}/unlink`);
  }

  getCareContexts(patientId: string) {
    return this.http.get<ApiResponse<CareContext[]>>(`${this.api}/patients/${patientId}/care-contexts`);
  }
}
