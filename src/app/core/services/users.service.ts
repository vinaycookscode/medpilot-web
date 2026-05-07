import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { AuthUser, ChangePasswordRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<ApiResponse<AuthUser>>(`${environment.apiUrl}/auth/me`);
  }

  updateProfile(body: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'phone'>>) {
    return this.http.put<ApiResponse<AuthUser>>(`${this.api}/me`, body);
  }
}
