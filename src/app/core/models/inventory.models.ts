export interface InventoryItem {
  id: string;
  clinicId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface InventorySummary {
  total: number;
  lowStock: number;
  outStock: number;
  categories: string[];
}

export interface InventoryListResponse {
  items: InventoryItem[];
  summary: InventorySummary;
}

export type StockStatus = 'normal' | 'low' | 'out';

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.quantity <= 0) return 'out';
  if (item.quantity <= item.reorderLevel) return 'low';
  return 'normal';
}
