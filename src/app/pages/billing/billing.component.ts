import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { BillingService } from '../../core/services/billing.service';
import { PatientsService } from '../../core/services/patients.service';
import { PrescriptionsService } from '../../core/services/prescriptions.service';
import { ClinicService, ClinicDetail } from '../../core/services/clinic.service';
import { Invoice, Service } from '../../core/models/billing.models';
import { Patient } from '../../core/models/patient.models';
import { Prescription } from '../../core/models/prescription.models';
import { ToastService } from '../../core/services/toast.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { printInvoice } from '../../shared/print-invoice';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwSelectComponent } from '../../shared/ui/forms/select/select.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule, DatePipe, DecimalPipe, FormsModule, ReactiveFormsModule, IconsModule,
    GwButtonComponent, GwFormFieldComponent, GwInputComponent, GwSelectComponent, GwDialogComponent,
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss',
})
export class BillingComponent implements OnInit {
  private billingSvc  = inject(BillingService);
  private patientsSvc = inject(PatientsService);
  private rxSvc       = inject(PrescriptionsService);
  private clinicSvc   = inject(ClinicService);
  private toast       = inject(ToastService);
  private appMeta     = inject(AppMetaService);
  private fb          = inject(FormBuilder);

  readonly canCreate  = computed(() => this.appMeta.canDo('billing', 'canCreate'));

  readonly paymentMethods = [
    { value: 'cash',          label: 'Cash' },
    { value: 'card',          label: 'Card' },
    { value: 'upi',           label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'insurance',     label: 'Insurance' },
  ];

  readonly invoices       = signal<Invoice[]>([]);
  readonly total          = signal(0);
  readonly loading        = signal(true);
  readonly saving         = signal(false);
  readonly showCreate          = signal(false);
  readonly showDetail          = signal<Invoice | null>(null);
  readonly detailPrescriptions = signal<Prescription[]>([]);
  readonly detailRxLoading     = signal(false);
  readonly paymentInvoice      = signal<Invoice | null>(null);
  readonly services       = signal<Service[]>([]);
  readonly page           = signal(1);
  readonly pageSize       = signal(20);
  readonly sortCol        = signal<string>('invoiceDate');
  readonly sortDir        = signal<'asc' | 'desc'>('desc');

  readonly sorted = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir();
    return [...this.invoices()].sort((a, b) => {
      const av = col === 'patientName'
        ? `${(a as any).patient?.firstName ?? ''} ${(a as any).patient?.lastName ?? ''}`
        : (a as any)[col] ?? '';
      const bv = col === 'patientName'
        ? `${(b as any).patient?.firstName ?? ''} ${(b as any).patient?.lastName ?? ''}`
        : (b as any)[col] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
  });
  private clinic: ClinicDetail | null = null;

  // Patient search
  readonly patientResults  = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  readonly showPatientDrop = signal(false);
  private patSearch$ = new Subject<string>();

  // Prescriptions for selected patient
  readonly patientPrescriptions = signal<Prescription[]>([]);
  readonly rxLoading            = signal(false);
  readonly showRxSection        = signal(false);

  readonly form = this.fb.nonNullable.group({
    invoiceDate: [new Date().toISOString().split('T')[0]],
    dueDate:     [''],
    notes:       [''],
    items: this.fb.array([]),
  });

  readonly payForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    method: ['cash', Validators.required],
    notes:  [''],
  });

  get items() { return this.form.get('items') as FormArray; }

  readonly subtotal = computed(() => {
    const raw = this.form.getRawValue();
    return (raw.items as any[]).reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    }, 0);
  });

  ngOnInit() {
    this.load();
    this.billingSvc.listServices().subscribe(r => this.services.set(r.data));
    this.clinicSvc.getMe().subscribe(r => { this.clinic = r.data; });

    this.patSearch$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length < 2) { this.patientResults.set([]); return; }
      this.patientsSvc.list({ search: q, limit: 6 }).subscribe(r => {
        this.patientResults.set(r.data);
        this.showPatientDrop.set(r.data.length > 0);
      });
    });
  }

  load() {
    this.loading.set(true);
    this.billingSvc.listInvoices({ page: this.page(), limit: this.pageSize() } as any).subscribe({
      next: r => { this.invoices.set(r.data); this.total.set(r.meta.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Patient search ──
  onPatientSearch(event: Event) {
    this.patSearch$.next((event.target as HTMLInputElement).value);
  }

  selectPatient(p: Patient) {
    this.selectedPatient.set(p);
    this.patientResults.set([]);
    this.showPatientDrop.set(false);
    this.loadPatientPrescriptions(p.id);
  }

  clearPatient() {
    this.selectedPatient.set(null);
    this.patientPrescriptions.set([]);
    this.showRxSection.set(false);
  }

  loadPatientPrescriptions(patientId: string) {
    this.rxLoading.set(true);
    this.rxSvc.list({ patientId, limit: 10 }).subscribe({
      next: r => {
        this.patientPrescriptions.set(r.data);
        this.rxLoading.set(false);
        if (r.data.length > 0) this.showRxSection.set(true);
      },
      error: () => this.rxLoading.set(false),
    });
  }

  addMedicinesFromPrescription(rx: Prescription) {
    for (const med of rx.medicines ?? []) {
      this.items.push(this.fb.nonNullable.group({
        serviceId:   [''],
        description: [`${med.medicineName} — ${med.dosage}, ${med.frequency}, ${med.duration}`],
        quantity:    [1, [Validators.required, Validators.min(1)]],
        unitPrice:   [0, [Validators.required, Validators.min(0)]],
      }));
    }
    this.toast.success(`Added ${rx.medicines?.length ?? 0} medicines from prescription`);
  }

  // ── Items ──
  addItem() {
    this.items.push(this.fb.nonNullable.group({
      serviceId:   [''],
      description: ['', Validators.required],
      quantity:    [1, [Validators.required, Validators.min(1)]],
      unitPrice:   [0, [Validators.required, Validators.min(0)]],
    }));
  }

  removeItem(i: number) { this.items.removeAt(i); }

  onServiceSelect(event: Event, idx: number) {
    const id = (event.target as HTMLSelectElement).value;
    if (!id) return;
    const svc = this.services().find(s => s.id === id);
    if (svc) {
      this.items.at(idx).patchValue({ description: svc.name, unitPrice: svc.price });
    }
  }

  // ── Modals ──
  openCreate() {
    this.form.reset({ invoiceDate: new Date().toISOString().split('T')[0] });
    this.items.clear();
    this.selectedPatient.set(null);
    this.patientPrescriptions.set([]);
    this.showRxSection.set(false);
    this.addItem();
    this.showCreate.set(true);
  }

  closeCreate() { this.showCreate.set(false); }

  openDetail(inv: Invoice) {
    this.detailPrescriptions.set([]);
    this.billingSvc.getInvoice(inv.id).subscribe(r => {
      this.showDetail.set(r.data);
      if (r.data.patientId) {
        this.detailRxLoading.set(true);
        this.rxSvc.list({ patientId: r.data.patientId, limit: 20 }).subscribe({
          next: p => { this.detailPrescriptions.set(p.data); this.detailRxLoading.set(false); },
          error: () => this.detailRxLoading.set(false),
        });
      }
    });
  }

  closeDetail() { this.showDetail.set(null); this.detailPrescriptions.set([]); }

  openPayment(inv: Invoice) {
    this.payForm.reset({ method: 'cash', amount: inv.balanceDue });
    this.paymentInvoice.set(inv);
  }

  closePayment() { this.paymentInvoice.set(null); }

  // ── Print ──
  print(inv: Invoice) {
    if (!this.clinic) { this.toast.error('Clinic info not loaded yet'); return; }
    const rxData = this.detailPrescriptions().map(rx => ({
      diagnosis: rx.diagnosis,
      date: new Date(rx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      doctor: rx.doctor?.lastName ?? '',
      medicines: (rx.medicines ?? []).map(m => ({
        name: m.medicineName, dosage: m.dosage,
        frequency: m.frequency, duration: m.duration, timing: m.timing,
      })),
    })).filter(rx => rx.medicines.length > 0);
    printInvoice(inv, this.clinic, undefined, rxData.length ? rxData : undefined);
  }

  // ── Save ──
  save() {
    if (this.form.invalid || !this.selectedPatient() || this.saving()) return;
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const body: any = {
      patientId: this.selectedPatient()!.id,
      items: (raw.items as any[]).map(it => ({
        ...(it.serviceId ? { serviceId: it.serviceId } : {}),
        description: it.description,
        quantity:    Number(it.quantity),
        unitPrice:   Number(it.unitPrice),
      })),
      ...(raw.invoiceDate && { invoiceDate: raw.invoiceDate }),
      ...(raw.dueDate     && { dueDate: raw.dueDate }),
      ...(raw.notes       && { notes: raw.notes }),
    };

    this.billingSvc.createInvoice(body).subscribe({
      next: r => {
        this.invoices.update(list => [r.data, ...list]);
        this.total.update(t => t + 1);
        this.saving.set(false);
        this.showCreate.set(false);
        this.toast.success('Invoice created');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to create invoice');
      },
    });
  }

  savePayment() {
    const inv = this.paymentInvoice();
    if (!inv || this.payForm.invalid || this.saving()) return;
    this.saving.set(true);

    const raw = this.payForm.getRawValue();
    this.billingSvc.recordPayment(inv.id, {
      amount: Number(raw.amount),
      method: raw.method,
      ...(raw.notes && { notes: raw.notes }),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closePayment();
        this.closeDetail();
        this.load();
        this.toast.success('Payment recorded');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to record payment');
      },
    });
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      draft: 'badge--neutral', sent: 'badge--primary',
      paid: 'badge--success',  partial: 'badge--warning', partially_paid: 'badge--warning',
      overdue: 'badge--danger', cancelled: 'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }

  statusLabel(status: string) {
    return status === 'partially_paid' ? 'partial' : status;
  }

  get totalPages() { return Math.ceil(this.total() / this.pageSize()); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.load(); } }
  changePageSize(n: number) { this.pageSize.set(n); this.page.set(1); this.load(); }

  sort(col: string) {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  sortIcon(col: string): string {
    if (this.sortCol() !== col) return 'chevrons-up-down';
    return this.sortDir() === 'asc' ? 'chevron-up' : 'chevron-down';
  }
}
