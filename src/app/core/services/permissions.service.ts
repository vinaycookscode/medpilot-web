import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    return this.http.get<PermMatrix>(`${this.api}/matrix`);
  }
  getRoles() {
    return this.http.get<string[]>(`${this.api}/roles`);
  }
  getModules() {
    return this.http.get<string[]>(`${this.api}/modules`);
  }
  bulkUpdate(updates: RolePermUpdate[]) {
    return this.http.put<any>(`${this.api}/bulk`, { updates });
  }
}
