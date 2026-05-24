import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface PermMatrix {
  [role: string]: {
    [module: string]: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canApprove: boolean;
    };
  };
}

export interface RolePermUpdate {
  role: string;
  module: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly api = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  getMatrix() {
    return this.http.get<ApiResponse<PermMatrix>>(`${this.api}/matrix`).pipe(map(r => r.data));
  }
  getRoles() {
    return this.http.get<ApiResponse<string[]>>(`${this.api}/roles`).pipe(map(r => r.data));
  }
  getModules() {
    return this.http.get<ApiResponse<string[]>>(`${this.api}/modules`).pipe(map(r => r.data));
  }
  bulkUpdate(updates: RolePermUpdate[]) {
    return this.http.put<ApiResponse<void>>(`${this.api}/bulk`, { updates }).pipe(map(r => r.data));
  }
}
