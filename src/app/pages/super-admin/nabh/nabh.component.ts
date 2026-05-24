import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons';
import { NabhService, NabhItem, NabhDailyRow, NabhMonthlyReport } from '../../../core/services/nabh.service';

type View = 'daily' | 'items' | 'report';

@Component({
  selector: 'app-nabh',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './nabh.component.html',
  styleUrl: './nabh.component.scss',
})
export class NabhComponent implements OnInit {
  readonly view = signal<View>('daily');
  readonly loading = signal(false);

  // Daily
  readonly selectedDate = signal(new Date().toISOString().split('T')[0]);
  readonly dailyRows = signal<NabhDailyRow[]>([]);
  readonly departments = signal<string[]>([]);
  readonly filterDept = signal('');

  readonly filteredRows = computed(() => {
    const dept = this.filterDept();
    return dept ? this.dailyRows().filter(r => r.item.department === dept) : this.dailyRows();
  });

  readonly dailyStats = computed(() => {
    const all = this.dailyRows().flatMap(r => r.shiftStatuses);
    return {
      total: all.length,
      completed: all.filter(s => s.status === 'completed').length,
      pending: all.filter(s => s.status === 'pending').length,
      missed: all.filter(s => s.status === 'missed').length,
    };
  });

  // Items management
  readonly items = signal<NabhItem[]>([]);
  readonly showItemModal = signal(false);
  readonly editingItem = signal<NabhItem | null>(null);
  itemForm: Partial<NabhItem> = {};
  readonly SHIFTS = ['morning', 'evening', 'night', 'all'];
  readonly FREQUENCIES = ['daily', 'weekly'];

  // Monthly report
  readonly report = signal<NabhMonthlyReport | null>(null);
  readonly reportYear = signal(new Date().getFullYear());
  readonly reportMonth = signal(new Date().getMonth() + 1);
  readonly MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(private svc: NabhService) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadDaily();
  }

  loadDepartments() {
    this.svc.getDepartments().subscribe(d => this.departments.set(d));
  }

  loadDaily() {
    this.loading.set(true);
    this.svc.getDailyStatus(this.selectedDate()).subscribe({
      next: rows => { this.dailyRows.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadItems() {
    this.svc.listItems().subscribe(items => this.items.set(items));
  }

  loadReport() {
    this.loading.set(true);
    this.svc.getMonthlyReport(this.reportYear(), this.reportMonth()).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setView(v: View) {
    this.view.set(v);
    if (v === 'items' && this.items().length === 0) this.loadItems();
    if (v === 'report' && !this.report()) this.loadReport();
  }

  markComplete(row: NabhDailyRow, shiftStatus: any) {
    const next = shiftStatus.status === 'completed' ? 'pending' : 'completed';
    this.svc.logCompletion({
      checklistItemId: row.item.id,
      date: this.selectedDate(),
      shift: shiftStatus.shift,
      status: next,
    }).subscribe(() => this.loadDaily());
  }

  openAddItem() {
    this.editingItem.set(null);
    this.itemForm = { frequency: 'daily', shift: 'all', isActive: true, displayOrder: 0 };
    this.showItemModal.set(true);
  }

  openEditItem(item: NabhItem) {
    this.editingItem.set(item);
    this.itemForm = { ...item };
    this.showItemModal.set(true);
  }

  saveItem() {
    const editing = this.editingItem();
    const obs = editing ? this.svc.updateItem(editing.id, this.itemForm) : this.svc.createItem(this.itemForm);
    obs.subscribe(() => { this.showItemModal.set(false); this.loadItems(); this.loadDepartments(); });
  }

  deleteItem(id: string) {
    if (!confirm('Delete this checklist item?')) return;
    this.svc.deleteItem(id).subscribe(() => this.loadItems());
  }

  statusClass(s: string) {
    return { completed: 'status--completed', pending: 'status--pending', missed: 'status--missed', escalated: 'status--escalated' }[s] ?? '';
  }

  complianceColor(rate: number) {
    if (rate >= 90) return '#10B981';
    if (rate >= 70) return '#F59E0B';
    return '#EF4444';
  }
}
