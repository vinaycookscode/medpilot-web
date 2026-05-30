import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
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
import { GwTableComponent, GwTableColumn } from '../../shared/ui/data/table/table.component';
import { GwCellDirective } from '../../shared/ui/data/table/cell.directive';

type DeptTab = 'pathology' | 'xray' | 'ct_scan' | 'cathlab' | 'mri';
type ViewMode = 'dashboard' | 'orders';

const DEPT_LABELS: Record<DeptTab, string> = {
  pathology: 'Pathology', xray: 'X-Ray', ct_scan: 'CT Scan', cathlab: 'Cathlab', mri: 'MRI',
};

const DEPT_ICONS: Record<DeptTab, string> = {
  pathology: 'flask-conical', xray: 'scan-line', ct_scan: 'scan', cathlab: 'activity', mri: 'circle-dot',
};

const ALL_DEPTS: DeptTab[] = ['pathology', 'xray', 'ct_scan', 'cathlab', 'mri'];

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
    GwTableComponent, GwCellDirective,
  ],
  templateUrl: './investigations.component.html',
  styleUrl: './investigations.component.scss',
})
export class InvestigationsComponent implements OnInit, OnDestroy {
  patientSearch = '';

  private svc       = inject(InvestigationsService);
  private sanitizer = inject(DomSanitizer);
  private http      = inject(HttpClient);
  private patients = inject(PatientsService);
  private toast    = inject(ToastService);
  private fb       = inject(FormBuilder);
  readonly auth    = inject(AuthService);
  private appMeta  = inject(AppMetaService);

  readonly canApprove = computed(() => this.appMeta.canDo('investigations', 'canApprove'));

  readonly isDeptUser = computed(() => {
    const r = this.auth.role();
    return r === 'lab_tech' || r === 'radiology_tech';
  });
  readonly isOrderingUser = computed(() => {
    const r = this.auth.role();
    return r === 'doctor' || r === 'consultant' || r === 'rmo' || r === 'admin';
  });
  readonly isBillingUser = computed(() => {
    const r = this.auth.role();
    return r === 'billing_staff' || r === 'admin';
  });

  /** Tabs visible to the current user — dept users see only their own department(s) */
  readonly visibleDepts = computed<DeptTab[]>(() => {
    const r = this.auth.role();
    if (r === 'lab_tech')       return ['pathology'];
    if (r === 'radiology_tech') return ['xray', 'ct_scan', 'cathlab', 'mri'];
    return ALL_DEPTS;
  });

  readonly deptLabels = DEPT_LABELS;
  readonly deptIcons  = DEPT_ICONS;

  readonly orderColumns: GwTableColumn[] = [
    { key: 'orderNumber', label: 'Order #',    width: '110px' },
    { key: 'patient',     label: 'Patient' },
    { key: 'orderedBy',   label: 'Ordered by', width: '160px' },
    { key: 'urgency',     label: 'Urgency',    width: '90px'  },
    { key: 'expectedAt',  label: 'Expected',   width: '130px' },
    { key: 'status',      label: 'Status',     width: '120px' },
    { key: 'billing',     label: 'Billing',    width: '100px' },
    { key: 'actions',     label: '',           width: '210px', align: 'right' },
  ];

  readonly historyColumns: GwTableColumn[] = [
    { key: 'orderNumber', label: 'Order #',    width: '110px' },
    { key: 'patient',     label: 'Patient' },
    { key: 'department',  label: 'Department', width: '120px' },
    { key: 'orderedBy',   label: 'Ordered by', width: '150px' },
    { key: 'reportedAt',  label: 'Reported at', width: '140px' },
    { key: 'status',      label: 'Status',     width: '110px' },
    { key: 'viewAction',  label: '',           width: '80px',  align: 'right' },
  ];

  readonly activeTab  = signal<DeptTab>('pathology');
  readonly viewMode   = signal<ViewMode>('orders');
  readonly loading    = signal(false);
  readonly saving     = signal(false);
  readonly orders     = signal<InvestigationOrder[]>([]);
  readonly catalog    = signal<InvestigationCatalogItem[]>([]);
  readonly total      = signal(0);

  // Dashboard
  readonly dashStats   = signal<{ pending: number; orderedToday: number; inProgressToday: number; reportedToday: number; billedToday: number } | null>(null);
  readonly dashHistory = signal<InvestigationOrder[]>([]);
  readonly dashLoading = signal(false);

  // Queue count badge
  readonly pendingQueueCount = computed(() => this.dashStats()?.pending ?? 0);

  // Modals
  readonly showCreateModal  = signal(false);
  readonly showReportModal  = signal(false);
  readonly showViewModal    = signal(false);
  readonly showBillingModal = signal(false);
  readonly selectedOrder    = signal<InvestigationOrder | null>(null);
  readonly reportLoading    = signal(false);

  // Patient search
  readonly patientResults  = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  private ptTimer: any;

  // Pathology item results (edited inline in modal)
  readonly editedItems = signal<Record<string, { result: string; isAbnormal: boolean; remarks: string }>>({});

  // Manual test rows added by lab tech when order has no catalog items
  readonly manualItems = signal<{ testName: string; result: string; isAbnormal: boolean; remarks: string }[]>([]);

  addManualItem() {
    this.manualItems.update(items => [...items, { testName: '', result: '', isAbnormal: false, remarks: '' }]);
  }

  updateManualItem(idx: number, field: string, value: any) {
    this.manualItems.update(items => {
      const updated = [...items];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }

  removeManualItem(idx: number) {
    this.manualItems.update(items => items.filter((_, i) => i !== idx));
  }
  reportFileUrl  = signal('');
  reportNotes    = signal('');
  uploadedFile   = signal<File | null>(null);
  uploadProgress = signal(false);

  // Full-screen file viewer
  readonly showFileViewer  = signal(false);
  readonly viewerFileUrl   = signal('');   // original URL (for download link)
  readonly viewerBlobUrl   = signal('');   // blob: URL used in iframe (bypasses CSP)
  readonly viewerFileName  = signal('');
  readonly viewerLoading   = signal(false);

  openFileViewer(url: string | undefined | null, name?: string | undefined | null) {
    const resolved = this.fileUrl(url ?? '');
    if (!resolved) {
      this.toast.show('No file attached to this report', 'warning');
      return;
    }
    // Show viewer immediately with loading state
    this.viewerFileUrl.set(resolved);
    this.viewerFileName.set((name?.trim() || resolved.split('/').pop() || 'Report')
      .replace(/^\d+-\d+\./, 'report.'));  // strip multer timestamp prefix
    this.viewerLoading.set(true);
    this.showFileViewer.set(true);

    // Fetch as blob → create same-origin blob: URL → no CSP frame-ancestors issue
    this.http.get(resolved, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.revokeBlobUrl();
        const blobUrl = URL.createObjectURL(blob);
        this.viewerBlobUrl.set(blobUrl);
        this.viewerLoading.set(false);
      },
      error: () => {
        this.viewerLoading.set(false);
        this.toast.show('Failed to load file — check the server is running', 'danger');
      },
    });
  }

  closeFileViewer() {
    this.revokeBlobUrl();
    this.showFileViewer.set(false);
  }

  private revokeBlobUrl() {
    const prev = this.viewerBlobUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.viewerBlobUrl.set('');
  }

  ngOnDestroy() { this.revokeBlobUrl(); }

  isPdf(url: string) { return /\.pdf($|\?)/i.test(url); }

  safeUrl(url: string) { return this.sanitizer.bypassSecurityTrustResourceUrl(url); }

  /** Absolute URL for serving files — works in dev and prod */
  fileUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${window.location.protocol}//${window.location.hostname}:3000${path}`;
  }

  // Billing clearance
  readonly billingTotal = signal(0);

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
    totalAmount:         [0, [Validators.required, Validators.min(0.01)]],
    hospitalPayable:     [0],
    customerPayable:     [0],
    insurancePayable:    [0],
    insuranceProviderId: [''],
    policyNumber:        [''],
    memberName:          [''],
    billingNotes:        [''],
  });

  ngOnInit() {
    // Set default tab to first visible dept
    const first = this.visibleDepts()[0];
    if (first) this.activeTab.set(first);

    // Dept users land on dashboard first; ordering users land on orders
    const mode: ViewMode = this.isDeptUser() ? 'dashboard' : 'orders';
    this.viewMode.set(mode);

    if (mode === 'dashboard') this.loadDashboard();
    else this.load();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  load() {
    this.loading.set(true);
    this.svc.getOrders({ departmentType: this.activeTab(), limit: '50' }).subscribe({
      next: (res) => { this.orders.set(res.data ?? []); this.total.set(res.meta?.total ?? 0); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.show('Failed to load orders', 'danger'); },
    });
  }

  loadDashboard() {
    this.dashLoading.set(true);
    this.svc.getStats().subscribe({
      next: (res) => {
        this.dashStats.set(res.data?.stats ?? null);
        this.dashHistory.set(res.data?.recentHistory ?? []);
        this.dashLoading.set(false);
      },
      error: () => { this.dashLoading.set(false); },
    });
  }

  switchTab(tab: DeptTab) {
    this.activeTab.set(tab);
    this.load();
    this.svc.getCatalog(tab as InvestigationDepartment).subscribe({
      next: (res) => this.catalog.set(res.data ?? []),
    });
  }

  switchView(mode: ViewMode) {
    this.viewMode.set(mode);
    if (mode === 'dashboard') this.loadDashboard();
    else this.load();
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  count(status: string) { return this.orders().filter(o => o.status === status).length; }
  pendingBillingCount() { return this.orders().filter(o => o.status === 'reported' && o.billingStatus === 'pending').length; }

  // ── Patient search ────────────────────────────────────────────────────────
  onPatientSearch(q: string) {
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
    this.patientSearch = '';
    this.patientResults.set([]);
  }

  clearPatient() {
    this.selectedPatient.set(null);
    this.createForm.patchValue({ patientId: '' });
    this.patientSearch = '';
  }

  // ── Create order ──────────────────────────────────────────────────────────
  openCreateModal() {
    this.createForm.reset({ urgency: 'routine' });
    this.selectedPatient.set(null);
    this.patientSearch = '';
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
      payload.procedureType    = f.procedureType || undefined;
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

  // ── Dept actions ──────────────────────────────────────────────────────────
  acceptOrder(order: InvestigationOrder) {
    this.svc.acceptOrder(order.id).subscribe({
      next: () => { this.toast.show('Order accepted', 'success'); this.load(); this.loadDashboard(); },
      error: () => this.toast.show('Failed to accept order', 'danger'),
    });
  }

  collectSample(order: InvestigationOrder) {
    this.svc.collectSample(order.id).subscribe({
      next: () => { this.toast.show('Sample collected', 'success'); this.load(); },
      error: () => this.toast.show('Failed to update', 'danger'),
    });
  }

  // ── Report modal ──────────────────────────────────────────────────────────
  openReportModal(order: InvestigationOrder) {
    // Show the dialog immediately with list data so title / meta are visible right away
    this.selectedOrder.set(order);
    this.reportFileUrl.set('');
    this.reportNotes.set('');
    this.editedItems.set({});
    this.manualItems.set([]);
    this.uploadedFile.set(null);
    this.uploadProgress.set(false);
    this.reportLoading.set(true);
    this.showReportModal.set(true);

    // Then fetch the full order (with items) to populate the result table
    this.svc.getById(order.id).subscribe({
      next: (res) => {
        this.selectedOrder.set(res.data);
        const init: Record<string, { result: string; isAbnormal: boolean; remarks: string }> = {};
        (res.data.items ?? []).forEach(item => {
          init[item.id] = {
            result: item.result ?? '',
            isAbnormal: item.isAbnormal ?? false,
            remarks: item.remarks ?? '',
          };
        });
        this.editedItems.set(init);
        this.reportLoading.set(false);
      },
      error: () => { this.reportLoading.set(false); this.toast.show('Failed to load order details', 'danger'); },
    });
  }

  onReportFileSelected(files: File | File[] | null) {
    const file = Array.isArray(files) ? files[0] : files;
    if (!file) return;
    const order = this.selectedOrder();
    if (!order) return;
    this.uploadedFile.set(file);
    this.uploadProgress.set(true);
    this.svc.uploadReportFile(order.id, file).subscribe({
      next: (res) => {
        this.reportFileUrl.set(res.data.fileUrl);
        this.uploadProgress.set(false);
        this.toast.show('File uploaded successfully', 'success');
      },
      error: () => {
        this.uploadProgress.set(false);
        this.uploadedFile.set(null);
        this.toast.show('File upload failed', 'danger');
      },
    });
  }

  // ── View report (read-only) ───────────────────────────────────────────────
  openViewModal(order: InvestigationOrder) {
    this.reportLoading.set(true);
    this.showViewModal.set(true);
    this.svc.getById(order.id).subscribe({
      next: (res) => { this.selectedOrder.set(res.data); this.reportLoading.set(false); },
      error: () => { this.reportLoading.set(false); },
    });
  }

  setItemField(itemId: string, field: 'result' | 'isAbnormal' | 'remarks', value: any) {
    const cur = this.editedItems();
    this.editedItems.set({ ...cur, [itemId]: { ...cur[itemId], [field]: value } });
  }

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
      // Existing catalog items (pre-seeded)
      if ((order.items ?? []).length) {
        payload.items = order.items.map(item => {
          const e = this.editedItems()[item.id] ?? {};
          return { itemId: item.id, result: e.result, isAbnormal: e.isAbnormal, remarks: e.remarks };
        });
      }
      // Manual items added by lab tech (orders created before catalog existed)
      if (this.manualItems().length) {
        payload.newItems = this.manualItems()
          .filter(i => i.testName.trim())
          .map(i => ({ testName: i.testName, result: i.result, isAbnormal: i.isAbnormal, remarks: i.remarks }));
      }
    }

    this.svc.submitReport(order.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showReportModal.set(false);
        this.toast.show('Report submitted — ordering doctor notified', 'success');
        this.load();
        this.loadDashboard();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to submit report', 'danger');
      },
    });
  }

  // ── Billing clearance ─────────────────────────────────────────────────────
  openBillingModal(order: InvestigationOrder) {
    this.selectedOrder.set(order);
    this.billingTotal.set(+order.totalAmount || 0);
    this.billingForm.reset({
      totalAmount: order.totalAmount || 0,
      hospitalPayable: order.hospitalPayable || 0,
      customerPayable: order.customerPayable || 0,
      insurancePayable: order.insurancePayable || 0,
      insuranceProviderId: '', policyNumber: '', memberName: '', billingNotes: '',
    });
    this.showBillingModal.set(true);
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
      totalAmount: total, hospitalPayable: hosp, customerPayable: cust, insurancePayable: ins,
      insuranceProviderId: f.insuranceProviderId || undefined,
      policyNumber: f.policyNumber || undefined,
      memberName: f.memberName || undefined,
      billingNotes: f.billingNotes || undefined,
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

  // ── Cancel ────────────────────────────────────────────────────────────────
  cancelOrder(order: InvestigationOrder) {
    if (!confirm(`Cancel order ${order.orderNumber}?`)) return;
    this.svc.cancelOrder(order.id).subscribe({
      next: () => { this.toast.show('Order cancelled', 'success'); this.load(); },
      error: () => this.toast.show('Failed to cancel', 'danger'),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  fullName(u?: { firstName: string; lastName: string } | null) {
    return u ? `${u.firstName} ${u.lastName}` : '—';
  }

  statusVariant(s: string): 'primary' | 'warning' | 'success' | 'danger' | 'neutral' | 'info' {
    const m: Record<string, any> = {
      ordered: 'primary', sample_collected: 'info', in_progress: 'warning',
      reported: 'success', billed: 'success', cancelled: 'neutral',
    };
    return m[s] ?? 'neutral';
  }

  urgencyVariant(u: string): 'danger' | 'warning' | 'neutral' {
    if (u === 'stat') return 'danger';
    if (u === 'urgent') return 'warning';
    return 'neutral';
  }

  canAccept(o: InvestigationOrder)  { return o.status === 'ordered'; }
  canCollect(o: InvestigationOrder) { return o.departmentType === 'pathology' && o.status === 'ordered'; }
  canReport(o: InvestigationOrder)  { return o.status === 'ordered' || o.status === 'sample_collected' || o.status === 'in_progress'; }
  canBill(o: InvestigationOrder)    { return o.status === 'reported' && o.billingStatus === 'pending'; }
  canCancel(o: InvestigationOrder)  { return o.status === 'ordered' || o.status === 'sample_collected'; }
  isImaging(o: InvestigationOrder)  { return o.departmentType !== 'pathology'; }
  isReported(o: InvestigationOrder) { return o.status === 'reported' || o.status === 'billed'; }

  titleCase(s: string) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  deptLabel(dept: string): string { return (DEPT_LABELS as Record<string, string>)[dept] ?? dept; }
}
