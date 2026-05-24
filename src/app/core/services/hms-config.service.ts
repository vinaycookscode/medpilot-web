import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface MetaItem {
  id: string;
  type: string;
  value: string;
  label: string;
  color: string | null;
  displayOrder: number;
  isActive: boolean;
  meta?: Record<string, any>;
}

export interface UpsertMetaItemDto {
  id?: string;
  type: string;
  value: string;
  label: string;
  color?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class HmsConfigService {
  private readonly api = `${environment.apiUrl}/hms-config`;

  constructor(private http: HttpClient) {}

  getAllItems() {
    return this.http.get<ApiResponse<MetaItem[]>>(`${this.api}/meta/items`).pipe(map(r => r.data));
  }

  getTypes() {
    return this.http.get<ApiResponse<string[]>>(`${this.api}/meta/types`).pipe(map(r => r.data));
  }

  upsert(dto: UpsertMetaItemDto) {
    return this.http.post<ApiResponse<MetaItem>>(`${this.api}/meta`, dto).pipe(map(r => r.data));
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.api}/meta/${id}`);
  }

  reorder(updates: Array<{ id: string; displayOrder: number }>) {
    return this.http.put<void>(`${this.api}/meta/reorder`, { updates });
  }

  seedDefaults() {
    return this.http.post<void>(`${this.api}/meta/seed`, {});
  }
}
