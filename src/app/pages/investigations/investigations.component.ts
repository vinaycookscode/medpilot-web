import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { PatientsService } from '../../core/services/patients.service';
import { ToastService } from '../../core/services/toast.service';
import {
  InvestigationsService,
  InvestigationOrder,
  InvestigationCatalogItem,
  InvestigationDepartment,
  InvestigationUrgency,
} from '../../core/services/investigations.service';
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
import { GwToggleComponent } from '../../shared/ui/forms/toggle/toggle.component';
import { GwCurrencyInputComponent } from '../../shared/ui/forms/currency-input/currency-input.component';
import { GwAlertComponent } from '../../shared/ui/feedback/alert/alert.component';
import { GwDatetimeInputComponent } from '../../shared/ui/forms/datetime-input/datetime-input.component';
import { GwAvatarComponent } from '../../shared/ui/display/avatar/avatar.component';
import { GwFileInputComponent } from '../../shared/ui/forms/file-input/file-input.component';

type DeptTab = 'pathology' | 'xray' | 'ct_scan' | 'cathlab' | 'mri';
type ViewMode = 'orders' | 'queue' | 'billing';

const DEPT_LABELS: Record<DeptTab, string> = {
  pathology: 'Pathology', xray: 'X-Ray', ct_scan: 'CT Scan', cathlab: 'Cathlab', mri: 'MRI',
};

const DEPT_ICONS: Record<DeptTab, string> = {
  pathology: 'flask-conical', xray: 'scan-line', ct_scan: 'scan', cathlab: 'activity', mri: 'circle-dot',
};

@Component({
  selector: 'app-investigations',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, DecimalPipe, DatePipe, IconsModule,
    GwButtonComponent, GwIconButtonComponent, GwBadgeComponent, GwCardComponent,
    GwStatCardComponent, GwSpinnerComponent, GwEmptyStateComponent, GwDialogComponent,
    GwFormFieldComponent, GwInputComponent, GwTextareaComponent, GwSelectComponent,
    GwToggleComponent, GwCurrencyInputComponent, GwAlertComponent,
    GwDatetimeInputComponent, GwAvatarComponent, GwFileInputComponent,
  ],
  templateUrl: './investigations.component.html',
  styleUrl: './investigations.component.scss',
})
export class InvestigationsComponent implements OnInit {
  // Two-way bound to gw-input for patient search (template-driven bridge)
  patientSearch = '';
  private svc      = inject(InvestigationsService);
  private patients = inject(PatientsService);
  private toast    = inject(ToastService);
  private fb       = inject(FormBuilder);
  readonly auth    = inject(AuthService);
  private appMeta  = inject(AppMetaService);

  readonly canCreate  = computed(() => this.appMeta.canDo('investigations', 'canCreate'));
  readonly canEdit    = computed(() => this.appMeta.canDo('investigations', 'canEdit'));
  readonly canApprove = computed(() => this.appMeta.canDo('investigations', 'canApprove'));

  readonly isDeptUser = computed(() => {
    const r = this.auth.role();
    return r === 'lab_tech' || r === 'radiology_tech';
  });
  readonly isBillingUser = computed(() => {
    const r = this.auth.role();
    return r === 'billing_staff' || r === 'admin';
  });

  readonly depts: DeptTab[] = ['pathology', 'xray', 'ct_scan', 'cathlab', 'mri'];
  readonly deptLabels = DEPT_LABELS;
  readonly deptIcons  = DEPT_ICONS;

  readonly activeTab   = signal<DeptTab>('pathology');
  readonly viewMode    = signal<ViewMode>('orders');
  readonly loading     = signal(false);
  readonly saving      = signal(false);
  readonly orders      = signal<InvestigationOrder[]>([]);
  readonly queue       = signal<InvestigationOrder[]>([]);
  readonly catalog     = signal<InvestigationCatalogItem[]>([]);
  readonly total       = signal(0);

  // Modals
  readonly showCreateModal   = signal(false);
  readonly showReportModal   = signal(false);
  readonly showBillingModal  = signal(false);
  readonly selectedOrder     = signal<InvestigationOrder | null>(null);

  // Patient search
  readonly patientQuery    = signal('');
  readonly patientResults  = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  readonly patientLoading  = signal(false);
  private ptTimer: any;

  // Pathology item results (edited inline)
  readonly editedItems = signal<Record<string, { result: string; isAbnormal: boolean; remarks: string }>>({});

  // Billing clearance split validation
  readonly billingTotal       = signal(0);
  readonly billingSplitValid  = computed(() => {
    // billingTotal is set when the modal opens; re-checked in submitBillingClearance
    return true; // validation done server-side + on submit
  });

  readonly urgencyOptions = [
    { value: 'routine', label: 'Routine' },
    { value: 'urgent',  label: 'Urgent' },
    { value: 'stat',    label: 'STAT — immediate' },
  ];

  createForm = this.fb.group({
    patientId:          ['', Validators.required],
    clinicalIndication: ['', Validators.required],
    urgency:            ['routine'],
    expectedReportAt:   [''],
    procedureType:      [''],
    referralDoctorId:   [''],
  });

  billingForm = this.fb.group({
    totalAmount:      [0, [Validators.required, Validators.min(0.01)]],
    hospitalPayable:  [0],
    customerPayable:  [0],
    insurancePayable: [0],
    insuranceProviderId: [''],
    policyNumber:     [''],
    memberName:       [''],
    billingNotes:     [''],
  });

  ngOnInit() {
    this.load();
    if (this.isDeptUser()) this.loadQueue();
  }

  load() {
    this.loading.set(true);
    const dept = this.activeTab();
    this.svc.getOrders({ departmentType: dept, limit: '50' }).subscribe({
      next: (res) => {
        this.orders.set(res.data ?? []);
        this.total.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.show('Failed to load orders', 'danger'); },
    });
  }

  loadQueue() {
    this.svc.getMyQueue().subscribe({
      next: (res) => this.queue.set(res.data ?? []),
      error: () => {},
    });
  }

  switchTab(tab: DeptTab) {
    this.activeTab.set(tab);
    this.load();
    if (tab !== 'pathology') {
      this.svc.getCatalog().subscribe({
        next: (res) => this.catalog.set(res.data ?? []),
      });
    } else {
      this.svc.getCatalog('pathology').subscribe({
        next: (res) => this.catalog.set(res.data ?? []),
      });
    }
  }

  // ── Computed counts ──────────────────────────────────────────────────────
  count(status: string) { return this.orders().filter(o => o.status === status).length; }
  pendingBillingCount() { return this.orders().filter(o => o.status === 'reported' && o.billingStatus === 'pending').length; }
  queueCount()          { return this.queue().length; }

  // ── Patient search ───────────────────────────────────────────────────────
  onPatientSearch(q: string) {
    this.patientQuery.set(q);
    clearTimeout(this.ptTimer);
    if (q.length < 2) { this.patientResults.set([]); return; }
    this.patientLoading.set(true);
    this.ptTimer = setTimeout(() => {
      this.patients.list({ search: q, limit: 8 }).subscribe({
        next: (res) => { this.patientResults.set(res.data ?? []); this.patientLoading.set(false); },
        error: () => this.patientLoading.set(false),
      });
    }, 300);
  }

  selectPatient(p: Patient) {
    this.selectedPatient.set(p);
    this.createForm.patchValue({ patientId: p.id });
    this.patientQuery.set('');
    this.patientResults.set([]);
  }

  clearPatient() {
    this.selectedPatient.set(null);
    this.createForm.patchValue({ patientId: '' });
  }

  // ── Create order ─────────────────────────────────────────────────────────
  openCreateModal() {
    this.createForm.reset({ urgency: 'routine' });
    this.selectedPatient.set(null);
    this.patientQuery.set('');
    this.patientResults.set([]);
    this.svc.getCatalog(this.activeTab() as InvestigationDepartment).subscribe({
      next: (res) => this.catalog.set(res.data ?? []),
    });
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const f = this.createForm.value;
    const payload: any = {
      patientId: f.patientId,
      departmentType: this.activeTab(),
      clinicalIndication: f.clinicalIndication,
      urgency: f.urgency || 'routine',
      expectedReportAt: f.expectedReportAt || undefined,
    };
    if (this.activeTab() === 'cathlab') {
      payload.procedureType   = f.procedureType || undefined;
      payload.referralDoctorId = f.referralDoctorId || undefined;
    }
    if (this.activeTab() === 'pathology' && this.catalog().length) {
      payload.items = this.catalog().map(c => ({ testName: c.name, amount: c.defaultAmount }));
    }
    this.svc.createOrder(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateModal.set(false);
        this.toast.show('Investigation ordered — department notified', 'success');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to create order', 'danger');
      },
    });
  }

  // ── Dept actions ─────────────────────────────────────────────────────────
  acceptOrder(order: InvestigationOrder) {
    this.svc.acceptOrder(order.id).subscribe({
      next: () => { this.toast.show('Order accepted', 'success'); this.load(); this.loadQueue(); },
      error: () => this.toast.show('Failed to accept order', 'danger'),
    });
  }

  collectSample(order: InvestigationOrder) {
    this.svc.collectSample(order.id).subscribe({
      next: () => { this.toast.show('Sample collected', 'success'); this.load(); this.loadQueue(); },
      error: () => this.toast.show('Failed to update', 'danger'),
    });
  }

  // ── Report modal ─────────────────────────────────────────────────────────
  openReportModal(order: InvestigationOrder) {
    this.selectedOrder.set(order);
    const init: Record<string, { result: string; isAbnormal: boolean; remarks: string }> = {};
    (order.items ?? []).forEach(item => {
      init[item.id] = { result: item.result ?? '', isAbnormal: item.isAbnormal ?? false, remarks: item.remarks ?? '' };
    });
    this.editedItems.set(init);
    this.showReportModal.set(true);
  }

  setItemField(itemId: string, field: 'result' | 'isAbnormal' | 'remarks', value: any) {
    const cur = this.editedItems();
    this.editedItems.set({ ...cur, [itemId]: { ...cur[itemId], [field]: value } });
  }

  reportFileUrl = signal('');
  reportNotes   = signal('');

  submitReport() {
    const order = this.selectedOrder();
    if (!order) return;
    this.saving.set(true);

    const isImaging = order.departmentType !== 'pathology';
    const payload: any = {};

    if (isImaging) {
      payload.reportFileUrl = this.reportFileUrl() || undefined;
      payload.reportNotes   = this.reportNotes() || undefined;
    } else {
      payload.items = (order.items ?? []).map(item => {
        const edited = this.editedItems()[item.id] ?? {};
        return {
          itemId:     item.id,
          result:     edited.result,
          isAbnormal: edited.isAbnormal,
          remarks:    edited.remarks,
        };
      });
    }

    this.svc.submitReport(order.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showReportModal.set(false);
        this.toast.show('Report submitted — ordering doctor notified', 'success');
        this.load();
        if (this.isDeptUser()) this.loadQueue();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to submit report', 'danger');
      },
    });
  }

  // ── Billing clearance modal ───────────────────────────────────────────────
  openBillingModal(order: InvestigationOrder) {
    this.selectedOrder.set(order);
    this.billingTotal.set(+order.totalAmount || 0);
    this.billingForm.reset({
      totalAmount:      order.totalAmount || 0,
      hospitalPayable:  order.hospitalPayable || 0,
      customerPayable:  order.customerPayable || 0,
      insurancePayable: order.insurancePayable || 0,
      insuranceProviderId: '',
      policyNumber: '',
      memberName: '',
      billingNotes: '',
    });
    this.showBillingModal.set(true);
  }

  onTotalChange(val: number | null) {
    this.billingTotal.set(val || 0);
  }

  submitBillingClearance() {
    const order = this.selectedOrder();
    if (!order) return;
    const f = this.billingForm.value;
    const total = +(f.totalAmount ?? 0);
    const hosp  = +(f.hospitalPayable ?? 0);
    const cust  = +(f.customerPayable ?? 0);
    const ins   = +(f.insurancePayable ?? 0);
    if (total > 0 && Math.abs(hosp + cust + ins - total) > 0.01) {
      this.toast.show(`Payable amounts must sum to ₹${total.toFixed(2)}`, 'danger');
      return;
    }
    this.saving.set(true);
    this.svc.setBillingClearance(order.id, {
      totalAmount:        total,
      hospitalPayable:    hosp,
      customerPayable:    cust,
      insurancePayable:   ins,
      insuranceProviderId: f.insuranceProviderId || undefined,
      policyNumber:       f.policyNumber || undefined,
      memberName:         f.memberName || undefined,
      billingNotes:       f.billingNotes || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showBillingModal.set(false);
        this.toast.show('Billing cleared — posted to patient invoice', 'success');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to set billing', 'danger');
      },
    });
  }

  // ── Cancel ───────────────────────────────────────────────────────────────
  cancelOrder(order: InvestigationOrder) {
    if (!confirm(`Cancel investigation order ${order.orderNumber}?`)) return;
    this.svc.cancelOrder(order.id).subscribe({
      next: () => { this.toast.show('Order cancelled', 'success'); this.load(); },
      error: () => this.toast.show('Failed to cancel', 'danger'),
    });
  }

  // ── Display helpers ───────────────────────────────────────────────────────
  fullName(u?: { firstName: string; lastName: string } | null) {
    return u ? `${u.firstName} ${u.lastName}` : '—';
  }

  statusVariant(status: string): 'primary' | 'warning' | 'success' | 'danger' | 'neutral' {
    const map: Record<string, any> = {
      ordered: 'primary', sample_collected: 'info', in_progress: 'warning',
      reported: 'success', billed: 'success', cancelled: 'neutral',
    };
    return map[status] ?? 'neutral';
  }

  urgencyVariant(u: string): 'danger' | 'warning' | 'neutral' {
    if (u === 'stat') return 'danger';
    if (u === 'urgent') return 'warning';
    return 'neutral';
  }

  canAccept(o: InvestigationOrder)     { return o.status === 'ordered'; }
  canCollect(o: InvestigationOrder)    { return o.departmentType === 'pathology' && o.status === 'ordered'; }
  canReport(o: InvestigationOrder)     { return o.status === 'sample_collected' || o.status === 'in_progress'; }
  canBill(o: InvestigationOrder)       { return o.status === 'reported' && o.billingStatus === 'pending'; }
  canCancel(o: InvestigationOrder)     { return o.status === 'ordered' || o.status === 'sample_collected'; }
  isImaging(o: InvestigationOrder)     { return o.departmentType !== 'pathology'; }

  titleCase(s: string) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
}
