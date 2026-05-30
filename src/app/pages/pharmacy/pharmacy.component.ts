import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { PatientsService } from '../../core/services/patients.service';
import { ToastService } from '../../core/services/toast.service';
import {
  PharmacyService,
  PharmacyOrder,
  PharmacyType,
  PendingPrescription,
} from '../../core/services/pharmacy.service';
import { Patient } from '../../core/models/patient.models';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwIconButtonComponent } from '../../shared/ui/buttons/icon-button/icon-button.component';
import { GwBadgeComponent } from '../../shared/ui/display/badge/badge.component';
import { GwCardComponent } from '../../shared/ui/display/card/card.component';
import { GwStatCardComponent } from '../../shared/ui/data/stat-card/stat-card.component';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';
import { GwEmptyStateComponent } from '../../shared/ui/display/empty-state/empty-state.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwSelectComponent } from '../../shared/ui/forms/select/select.component';
import { GwNumberInputComponent } from '../../shared/ui/forms/number-input/number-input.component';
import { GwCurrencyInputComponent } from '../../shared/ui/forms/currency-input/currency-input.component';
import { GwAlertComponent } from '../../shared/ui/feedback/alert/alert.component';
import { GwAvatarComponent } from '../../shared/ui/display/avatar/avatar.component';

const BILL_THRESHOLD = 2500;

type PharmacyTab = 'in_house' | 'out_house';

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, DecimalPipe, DatePipe, TitleCasePipe, IconsModule,
    GwButtonComponent, GwIconButtonComponent, GwBadgeComponent, GwCardComponent,
    GwStatCardComponent, GwSpinnerComponent, GwEmptyStateComponent, GwDialogComponent,
    GwFormFieldComponent, GwInputComponent, GwTextareaComponent, GwSelectComponent,
    GwNumberInputComponent, GwCurrencyInputComponent, GwAlertComponent, GwAvatarComponent,
  ],
  templateUrl: './pharmacy.component.html',
  styleUrl: './pharmacy.component.scss',
})
export class PharmacyComponent implements OnInit {
  private svc      = inject(PharmacyService);
  private patients = inject(PatientsService);
  private toast    = inject(ToastService);
  private fb       = inject(FormBuilder);
  readonly auth    = inject(AuthService);
  private appMeta  = inject(AppMetaService);

  patientSearchStr = '';
  readonly canCreate  = computed(() => this.appMeta.canDo('pharmacy', 'canCreate'));
  readonly canApprove = computed(() => this.appMeta.canDo('pharmacy', 'canApprove'));
  readonly THRESHOLD  = BILL_THRESHOLD;

  readonly activeTab  = signal<PharmacyTab>('in_house');
  readonly loading    = signal(false);
  readonly saving     = signal(false);
  readonly orders     = signal<PharmacyOrder[]>([]);
  readonly total      = signal(0);

  // Modals
  readonly showCreateModal  = signal(false);
  readonly showDispenseModal = signal(false);
  readonly selectedOrder    = signal<PharmacyOrder | null>(null);

  // Create order: prescription source
  readonly pendingPrescriptions = signal<PendingPrescription[]>([]);
  readonly selectedPrescription = signal<PendingPrescription | null>(null);
  readonly prescLoading         = signal(false);

  // Patient search (for manual order without prescription)
  readonly patientQuery   = signal('');
  readonly patientResults = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  private ptTimer: any;

  // Dispense: live total computation
  readonly dispenseTotal = computed(() => {
    const items = this.dispenseForm.get('items') as FormArray;
    if (!items) return 0;
    return (items.controls as any[]).reduce((sum: number, ctrl: any) => {
      const qty = +ctrl.get('dispensedQty')?.value || 0;
      const price = +ctrl.get('unitPrice')?.value || 0;
      return sum + qty * price;
    }, 0);
  });

  readonly overThreshold = computed(() => this.dispenseTotal() > BILL_THRESHOLD);

  createForm = this.fb.group({
    patientId: ['', Validators.required],
    notes: [''],
  });

  dispenseForm = this.fb.group({
    items: this.fb.array([]),
    notes: [''],
  });

  get dispenseItems() { return this.dispenseForm.get('items') as FormArray; }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getOrders({ pharmacyType: this.activeTab(), limit: '50' }).subscribe({
      next: (res) => {
        this.orders.set(res.data ?? []);
        this.total.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.show('Failed to load orders', 'danger'); },
    });
  }

  switchTab(tab: PharmacyTab) {
    this.activeTab.set(tab);
    this.load();
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  count(status: string)   { return this.orders().filter(o => o.status === status).length; }
  totalValue()            { return this.orders().reduce((s, o) => s + +o.totalAmount, 0); }
  pendingBillingCount()   { return this.orders().filter(o => o.status === 'dispensed' && o.billingStatus === 'pending').length; }

  // ── Create order ─────────────────────────────────────────────────────────
  openCreateModal() {
    this.createForm.reset();
    this.selectedPatient.set(null);
    this.selectedPrescription.set(null);
    this.patientQuery.set('');
    this.patientResults.set([]);
    this.prescLoading.set(true);
    this.svc.getPendingPrescriptions().subscribe({
      next: (res) => { this.pendingPrescriptions.set(res.data ?? []); this.prescLoading.set(false); },
      error: () => { this.prescLoading.set(false); },
    });
    this.showCreateModal.set(true);
  }

  onPatientSearch(q: string) {
    this.patientQuery.set(q);
    clearTimeout(this.ptTimer);
    if (q.length < 2) { this.patientResults.set([]); return; }
    this.ptTimer = setTimeout(() => {
      this.patients.list({ search: q, limit: 8 }).subscribe({
        next: (res) => this.patientResults.set(res.data ?? []),
      });
    }, 300);
  }

  selectPatient(p: Patient) {
    this.selectedPatient.set(p);
    this.createForm.patchValue({ patientId: p.id });
    this.patientQuery.set('');
    this.patientResults.set([]);
    this.selectedPrescription.set(null);
  }

  selectPrescription(presc: PendingPrescription) {
    this.selectedPrescription.set(presc);
    this.createForm.patchValue({ patientId: presc.patientId });
    this.selectedPatient.set({ id: presc.patientId, ...(presc.patient ?? {}) } as any);
  }

  submitCreate() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const presc = this.selectedPrescription();
    const payload: any = {
      patientId:    this.createForm.value.patientId,
      pharmacyType: this.activeTab(),
      notes:        this.createForm.value.notes || undefined,
    };
    if (presc) {
      payload.prescriptionId = presc.id;
      payload.items = presc.medicines.map(m => ({
        prescriptionMedicineId: m.id,
        medicineName: m.medicineName,
        dosage:       m.dosage,
        frequency:    m.frequency,
        duration:     m.duration,
        strength:     m.strength,
        form:         m.form,
        prescribedQty: 0,
        isBillable: true,
      }));
    } else {
      payload.items = [{ medicineName: 'To be filled on dispense', prescribedQty: 0, isBillable: true }];
    }
    this.svc.createOrder(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateModal.set(false);
        this.toast.show('Pharmacy order created', 'success');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to create order', 'danger');
      },
    });
  }

  // ── Dispense ──────────────────────────────────────────────────────────────
  openDispenseModal(order: PharmacyOrder) {
    this.selectedOrder.set(order);
    this.dispenseItems.clear();
    (order.items ?? []).forEach(item => {
      this.dispenseItems.push(this.fb.group({
        itemId:      [item.id],
        medicineName:[item.medicineName],
        dispensedQty:[item.dispensedQty || item.prescribedQty || 0, [Validators.required, Validators.min(0)]],
        unitPrice:   [item.unitPrice || 0, [Validators.required, Validators.min(0)]],
      }));
    });
    this.dispenseForm.patchValue({ notes: order.notes ?? '' });
    this.showDispenseModal.set(true);
  }

  submitDispense() {
    if (this.dispenseForm.invalid) { this.dispenseForm.markAllAsTouched(); return; }
    const order = this.selectedOrder();
    if (!order) return;
    this.saving.set(true);
    const items = (this.dispenseItems.value as any[]).map((i: any) => ({
      itemId:      i.itemId,
      dispensedQty:+i.dispensedQty,
      unitPrice:   +i.unitPrice,
    }));
    this.svc.dispense(order.id, { items, notes: this.dispenseForm.value.notes || undefined }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showDispenseModal.set(false);
        this.toast.show('Order dispensed', 'success');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to dispense', 'danger');
      },
    });
  }

  // ── Bill ──────────────────────────────────────────────────────────────────
  billOrder(order: PharmacyOrder) {
    this.svc.bill(order.id).subscribe({
      next: () => { this.toast.show('Bill posted to patient invoice', 'success'); this.load(); },
      error: (err) => this.toast.show(err?.error?.message ?? 'Failed to bill', 'danger'),
    });
  }

  clearOutbound(order: PharmacyOrder) {
    if (!confirm(`Mark all bills for order ${order.orderNumber} as cleared?`)) return;
    this.svc.clearOutbound(order.id).subscribe({
      next: () => { this.toast.show('Outbound bill cleared', 'success'); this.load(); },
      error: () => this.toast.show('Failed to clear', 'danger'),
    });
  }

  cancelOrder(order: PharmacyOrder) {
    if (!confirm(`Cancel order ${order.orderNumber}?`)) return;
    this.svc.cancelOrder(order.id).subscribe({
      next: () => { this.toast.show('Order cancelled', 'success'); this.load(); },
      error: () => this.toast.show('Failed to cancel', 'danger'),
    });
  }

  // ── Display helpers ───────────────────────────────────────────────────────
  fullName(u?: { firstName: string; lastName: string } | null) {
    return u ? `${u.firstName} ${u.lastName}` : '—';
  }

  statusVariant(s: string): 'primary' | 'warning' | 'success' | 'neutral' {
    const m: Record<string, any> = {
      pending: 'primary', dispensing: 'warning',
      dispensed: 'success', cancelled: 'neutral',
    };
    return m[s] ?? 'neutral';
  }

  billingVariant(s: string): 'neutral' | 'warning' | 'success' {
    if (s === 'billed') return 'warning';
    if (s === 'cleared') return 'success';
    return 'neutral';
  }

  canDispense(o: PharmacyOrder)    { return o.status === 'pending' || o.status === 'dispensing'; }
  canBill(o: PharmacyOrder)        { return o.status === 'dispensed' && o.billingStatus === 'pending'; }
  canClearOut(o: PharmacyOrder)    { return o.pharmacyType === 'out_house' && o.billingStatus === 'billed'; }
  canCancel(o: PharmacyOrder)      { return o.status === 'pending'; }
}
