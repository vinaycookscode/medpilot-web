import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons';
import { ChargeMasterService, ChargeMaster, Department, CHARGE_CATEGORIES } from '../../../core/services/charge-master.service';

type View = 'charges' | 'departments';

@Component({
  selector: 'app-charge-master',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './charge-master.component.html',
  styleUrl: './charge-master.component.scss',
})
export class ChargeMasterComponent implements OnInit {
  readonly view = signal<View>('charges');
  readonly charges = signal<ChargeMaster[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly loading = signal(false);
  readonly filterCategory = signal('');
  readonly searchQ = signal('');

  // Modals
  readonly showChargeModal = signal(false);
  readonly showDeptModal = signal(false);
  readonly showAuditModal = signal(false);
  readonly editingCharge = signal<ChargeMaster | null>(null);
  readonly editingDept = signal<Department | null>(null);
  readonly auditLogs = signal<any[]>([]);

  // Forms
  chargeForm: Partial<ChargeMaster> = {};
  deptForm: Partial<Department> = {};

  readonly categories = CHARGE_CATEGORIES;

  readonly filteredCharges = computed(() => {
    let list = this.charges();
    if (this.filterCategory()) list = list.filter(c => c.category === this.filterCategory());
    const q = this.searchQ().toLowerCase();
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    return list;
  });

  constructor(private svc: ChargeMasterService) {}

  ngOnInit() {
    this.load();
    this.svc.listDepartments().subscribe(d => this.departments.set(d));
  }

  load() {
    this.loading.set(true);
    this.svc.list().subscribe({ next: d => { this.charges.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openAddCharge() {
    this.editingCharge.set(null);
    this.chargeForm = { category: 'service', gstRate: 0, isActive: true, effectiveFrom: new Date().toISOString().split('T')[0] };
    this.showChargeModal.set(true);
  }

  openEditCharge(c: ChargeMaster) {
    this.editingCharge.set(c);
    this.chargeForm = { ...c, effectiveFrom: c.effectiveFrom?.split('T')[0] };
    this.showChargeModal.set(true);
  }

  saveCharge() {
    const editing = this.editingCharge();
    const obs = editing
      ? this.svc.update(editing.id, this.chargeForm)
      : this.svc.create(this.chargeForm);
    obs.subscribe({ next: () => { this.showChargeModal.set(false); this.load(); } });
  }

  deleteCharge(id: string) {
    if (!confirm('Delete this charge entry?')) return;
    this.svc.remove(id).subscribe(() => this.load());
  }

  openAudit(c: ChargeMaster) {
    this.svc.getAuditLog(c.id).subscribe(logs => { this.auditLogs.set(logs); this.showAuditModal.set(true); });
  }

  openAddDept() {
    this.editingDept.set(null);
    this.deptForm = { isActive: true };
    this.showDeptModal.set(true);
  }

  openEditDept(d: Department) {
    this.editingDept.set(d);
    this.deptForm = { ...d };
    this.showDeptModal.set(true);
  }

  saveDept() {
    const editing = this.editingDept();
    const obs = editing
      ? this.svc.updateDepartment(editing.id, this.deptForm)
      : this.svc.createDepartment(this.deptForm);
    obs.subscribe({ next: () => { this.showDeptModal.set(false); this.svc.listDepartments().subscribe(d => this.departments.set(d)); } });
  }

  deleteDept(id: string) {
    if (!confirm('Delete this department?')) return;
    this.svc.deleteDepartment(id).subscribe(() => this.svc.listDepartments().subscribe(d => this.departments.set(d)));
  }

  deptName(id?: string) {
    return this.departments().find(d => d.id === id)?.name ?? '—';
  }

  categoryBadgeClass(cat: string) {
    const map: Record<string, string> = {
      room: 'badge--blue', ot: 'badge--purple', investigation: 'badge--cyan',
      medicine: 'badge--green', service: 'badge--orange', consultation: 'badge--yellow',
      procedure: 'badge--red', other: 'badge--gray',
    };
    return map[cat] ?? 'badge--gray';
  }
}
