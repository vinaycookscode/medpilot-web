import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { InventoryItem, InventorySummary, stockStatus } from '../../core/models/inventory.models';

type StockTab = 'all' | 'low' | 'out';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, IconsModule, DecimalPipe, DatePipe],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toast = inject(ToastService);

  readonly stockStatus = stockStatus;

  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly items    = signal<InventoryItem[]>([]);
  readonly summary  = signal<InventorySummary>({ total: 0, lowStock: 0, outStock: 0, categories: [] });
  readonly tab      = signal<StockTab>('all');
  readonly search   = signal('');
  readonly category = signal('');
  readonly showForm = signal(false);
  readonly editItem = signal<InventoryItem | null>(null);
  readonly adjustTarget = signal<InventoryItem | null>(null);

  // Form fields
  form = this.blankForm();
  adjustType: 'in' | 'out' | 'adjustment' = 'in';
  adjustQty = 1;
  adjustNote = '';

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const cat = this.category();
    return this.items().filter(i => {
      if (q && !i.name.toLowerCase().includes(q) && !(i.manufacturer ?? '').toLowerCase().includes(q)) return false;
      if (cat && i.category !== cat) return false;
      const s = stockStatus(i);
      if (this.tab() === 'low' && s !== 'low') return false;
      if (this.tab() === 'out' && s !== 'out') return false;
      return true;
    });
  });

  ngOnInit() { this.load(); }

  load() {
    this.inventoryService.getAll().subscribe({
      next: r => {
        this.items.set(r.data?.items ?? []);
        this.summary.set(r.data?.summary ?? { total: 0, lowStock: 0, outStock: 0, categories: [] });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAdd() {
    this.editItem.set(null);
    this.form = this.blankForm();
    this.showForm.set(true);
  }

  openEdit(item: InventoryItem) {
    this.editItem.set(item);
    this.form = {
      name: item.name, category: item.category, unit: item.unit,
      quantity: item.quantity, reorderLevel: item.reorderLevel,
      costPrice: item.costPrice, sellingPrice: item.sellingPrice,
      manufacturer: item.manufacturer ?? '', batchNumber: item.batchNumber ?? '',
      expiryDate: item.expiryDate ?? '', description: item.description ?? '',
    };
    this.showForm.set(true);
  }

  saveForm() {
    this.saving.set(true);
    const existing = this.editItem();
    const req = existing
      ? this.inventoryService.update(existing.id, this.form)
      : this.inventoryService.create(this.form);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.show(existing ? 'Item updated' : 'Item added', 'success');
        this.load();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to save', 'danger'); },
    });
  }

  deleteItem(item: InventoryItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.inventoryService.delete(item.id).subscribe({
      next: () => { this.toast.show('Item deleted', 'success'); this.load(); },
      error: () => this.toast.show('Failed to delete', 'danger'),
    });
  }

  openAdjust(item: InventoryItem) {
    this.adjustTarget.set(item);
    this.adjustType = 'in';
    this.adjustQty = 1;
    this.adjustNote = '';
  }

  saveAdjust() {
    const item = this.adjustTarget();
    if (!item) return;
    this.inventoryService.adjustStock(item.id, { type: this.adjustType, quantity: this.adjustQty, note: this.adjustNote }).subscribe({
      next: () => {
        this.toast.show('Stock updated', 'success');
        this.adjustTarget.set(null);
        this.load();
      },
      error: () => this.toast.show('Failed to adjust stock', 'danger'),
    });
  }

  private blankForm() {
    return { name: '', category: 'Medicine', unit: 'units', quantity: 0, reorderLevel: 10, costPrice: 0, sellingPrice: 0, manufacturer: '', batchNumber: '', expiryDate: '', description: '' };
  }
}
