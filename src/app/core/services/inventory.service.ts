import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { InventoryItem, InventoryListResponse, InventoryTransaction } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAll(params: Record<string, string> = {}) {
    return this.http.get<ApiResponse<InventoryListResponse>>(this.api, { params });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<InventoryItem>>(`${this.api}/${id}`);
  }

  create(payload: Partial<InventoryItem>) {
    return this.http.post<ApiResponse<InventoryItem>>(this.api, payload);
  }

  update(id: string, payload: Partial<InventoryItem>) {
    return this.http.put<ApiResponse<InventoryItem>>(`${this.api}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  adjustStock(id: string, payload: { type: 'in' | 'out' | 'adjustment'; quantity: number; note?: string }) {
    return this.http.post<ApiResponse<InventoryItem>>(`${this.api}/${id}/adjust`, payload);
  }

  getTransactions(id: string) {
    return this.http.get<ApiResponse<InventoryTransaction[]>>(`${this.api}/${id}/transactions`);
  }

  getCategories() {
    return this.http.get<ApiResponse<string[]>>(`${this.api}/categories`);
  }
}
