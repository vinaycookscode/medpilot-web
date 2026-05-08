import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { LabsService, LabOrder, LabTest } from '../../core/services/labs.service';
import { PatientsService } from '../../core/services/patients.service';
import { Patient } from '../../core/models/patient.models';
import { ToastService } from '../../core/services/toast.service';

type LabTab = 'orders' | 'catalog';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [ReactiveFormsModule, IconsModule, DecimalPipe, DatePipe],
  templateUrl: './labs.component.html',
  styleUrl: './labs.component.scss',
})
export class LabsComponent implements OnInit {
  private labsService = inject(LabsService);
  private patientsService = inject(PatientsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly orders = signal<LabOrder[]>([]);
  readonly catalog = signal<LabTest[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly activeTab = signal<LabTab>('orders');
  readonly showOrderModal = signal(false);
  readonly showResultModal = signal(false);
  readonly selectedOrder = signal<LabOrder | null>(null);

  // Patient search
  readonly patientQuery = signal('');
  readonly patientDropdown = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  private patientSearchTimer: any;

  // Test selection
  readonly selectedTestIds = signal<Set<string>>(new Set());

  orderForm: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    notes: [''],
  });

  resultForm: FormGroup = this.fb.group({
    status: ['completed', Validators.required],
    notes: [''],
  });

  ngOnInit() {
    this.loadOrders();
    this.loadCatalog();
  }

  loadOrders() {
    this.loading.set(true);
    this.labsService.getOrders().subscribe({
      next: (res) => { this.orders.set(res.data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.show('Failed to load orders', 'danger'); },
    });
  }

  loadCatalog() {
    this.labsService.getTestCatalog().subscribe({
      next: (res) => this.catalog.set(res.data ?? []),
      error: () => this.toast.show('Failed to load test catalog', 'danger'),
    });
  }

  openOrderModal() {
    this.orderForm.reset({ patientId: '', notes: '' });
    this.patientQuery.set('');
    this.patientDropdown.set([]);
    this.selectedPatient.set(null);
    this.selectedTestIds.set(new Set());
    this.showOrderModal.set(true);
  }

  onPatientSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.patientQuery.set(q);
    clearTimeout(this.patientSearchTimer);
    if (q.length < 2) { this.patientDropdown.set([]); return; }
    this.patientSearchTimer = setTimeout(() => {
      this.patientsService.list({ search: q, limit: 8 }).subscribe({
        next: (res) => this.patientDropdown.set(res.data ?? []),
        error: () => {},
      });
    }, 300);
  }

  selectPatient(patient: Patient) {
    this.selectedPatient.set(patient);
    this.orderForm.patchValue({ patientId: patient.id });
    this.patientQuery.set('');
    this.patientDropdown.set([]);
  }

  clearPatient() {
    this.selectedPatient.set(null);
    this.orderForm.patchValue({ patientId: '' });
    this.patientDropdown.set([]);
  }

  toggleTest(testId: string) {
    const set = new Set(this.selectedTestIds());
    if (set.has(testId)) { set.delete(testId); } else { set.add(testId); }
    this.selectedTestIds.set(set);
  }

  submitOrder() {
    if (this.orderForm.invalid) return;
    if (this.selectedTestIds().size === 0) {
      this.toast.show('Select at least one test', 'danger');
      return;
    }
    this.saving.set(true);
    const payload = {
      patientId: this.orderForm.value.patientId,
      testIds: Array.from(this.selectedTestIds()),
      notes: this.orderForm.value.notes,
    };
    this.labsService.createOrder(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showOrderModal.set(false);
        this.toast.show('Lab order created', 'success');
        this.loadOrders();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to create order', 'danger'); },
    });
  }

  openResultModal(order: LabOrder) {
    this.selectedOrder.set(order);
    this.resultForm.reset({ status: 'completed', notes: '' });
    this.showResultModal.set(true);
  }

  submitResults() {
    const order = this.selectedOrder();
    if (!order) return;
    this.saving.set(true);
    this.labsService.updateResults(order.id, {
      items: order.items,
      status: this.resultForm.value.status,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showResultModal.set(false);
        this.selectedOrder.set(null);
        this.toast.show('Results updated', 'success');
        this.loadOrders();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to update results', 'danger'); },
    });
  }

  cancelOrder(id: string) {
    if (!confirm('Cancel this lab order?')) return;
    this.labsService.cancelOrder(id).subscribe({
      next: () => { this.toast.show('Order cancelled', 'success'); this.loadOrders(); },
      error: () => this.toast.show('Failed to cancel order', 'danger'),
    });
  }

  countByStatus(status: string): number {
    return this.orders().filter(o => o.status === status).length;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge--warning', processing: 'badge--primary',
      completed: 'badge--success', cancelled: 'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }

  statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
