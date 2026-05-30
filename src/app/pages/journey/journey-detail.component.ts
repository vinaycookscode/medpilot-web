import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { IpdService } from '../../core/services/ipd.service';
import { PrescriptionsService } from '../../core/services/prescriptions.service';
import { ToastService } from '../../core/services/toast.service';
import {
  EncountersService, PatientEncounter, EncounterStage, EncounterEvent,
  STAGE_LABELS, computeSteps, MedicationItemPayload, PayerType,
} from '../../core/services/encounters.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../shared/ui/display/badge/badge.component';
import { GwStepperComponent, GwStep } from '../../shared/ui/navigation/stepper/stepper.component';
import { GwTimelineComponent } from '../../shared/ui/data/timeline/timeline.component';
import { GwTimelineItemComponent, GwTimelineItemTone } from '../../shared/ui/data/timeline/timeline-item.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwSelectComponent, GwSelectOption } from '../../shared/ui/forms/select/select.component';
import { GwSegmentedComponent, GwSegmentOption } from '../../shared/ui/forms/segmented/segmented.component';
import { GwCurrencyInputComponent } from '../../shared/ui/forms/currency-input/currency-input.component';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';

type ModalKind = 'disposition' | 'admission' | 'casefile' | 'nurse' | 'medication' | 'checkout' | 'cancel' | null;

@Component({
  selector: 'app-journey-detail',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, RouterLink, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwStepperComponent, GwTimelineComponent,
    GwTimelineItemComponent, GwDialogComponent, GwFormFieldComponent, GwInputComponent,
    GwTextareaComponent, GwSelectComponent, GwSegmentedComponent, GwCurrencyInputComponent,
    GwSpinnerComponent,
  ],
  templateUrl: './journey-detail.component.html',
  styleUrl: './journey-detail.component.scss',
})
export class JourneyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(EncountersService);
  private appMeta = inject(AppMetaService);
  private ipdSvc = inject(IpdService);
  private prescSvc = inject(PrescriptionsService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly encounter = signal<PatientEncounter | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly modal = signal<ModalKind>(null);

  readonly stageLabels = STAGE_LABELS;
  readonly steps = computed<GwStep[]>(() => { const e = this.encounter(); return e ? computeSteps(e).steps : []; });
  readonly activeStep = computed(() => { const e = this.encounter(); return e ? computeSteps(e).active : 0; });

  // ─── Forms ────────────────────────────────────────────────────────────────
  dispForm = { disposition: 'opd_closed', note: '' };
  admForm = { admissionDiagnosis: '', attendantName: '', attendantPhone: '', attendantRelation: '' };
  caseForm = { payerType: 'cash' as PayerType, wardId: '', bedId: '', admissionType: 'emergency' };
  nurseForm = { nurseId: '', handoverNotes: '' };
  medForm = { pharmacyType: 'in_house', prescriptionId: '' };
  checkoutForm = { amount: null as number | null, paymentMode: 'cash', note: '' };

  readonly nurses = signal<{ id: string; firstName: string; lastName: string }[]>([]);
  readonly availableBeds = signal<any[]>([]);
  readonly prescriptions = signal<any[]>([]);
  readonly medItems = signal<MedicationItemPayload[]>([]);

  readonly dispositionOptions: GwSegmentOption[] = [
    { value: 'opd_closed', label: 'Send home (OPD)' },
    { value: 'investigation', label: 'Order tests' },
    { value: 'admit_ipd', label: 'Admit (IPD)' },
  ];
  readonly payerOptions: GwSegmentOption[] = [
    { value: 'cash', label: 'Cash' }, { value: 'cashless', label: 'Cashless' }, { value: 'pmjay', label: 'PMJAY' },
  ];
  readonly pharmacyTypeOptions: GwSegmentOption[] = [
    { value: 'in_house', label: 'In-House' }, { value: 'out_house', label: 'Out-House' },
  ];
  readonly paymentModeOptions: GwSegmentOption[] = [
    { value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'upi', label: 'UPI' },
  ];
  readonly admissionTypeOptions: GwSelectOption[] = [
    { value: 'emergency', label: 'Emergency' }, { value: 'elective', label: 'Elective' },
    { value: 'referral', label: 'Referral' }, { value: 'transfer', label: 'Transfer' },
  ];
  readonly wardOptions = computed<GwSelectOption[]>(() =>
    this.appMeta.wards().map(w => ({ value: w.id, label: w.name + (w.type ? ' · ' + w.type : '') })));
  readonly bedOptions = computed<GwSelectOption[]>(() =>
    this.availableBeds().map(b => ({ value: b.id, label: b.bedNumber })));
  readonly nurseOptions = computed<GwSelectOption[]>(() =>
    this.nurses().map(n => ({ value: n.id, label: `${n.firstName} ${n.lastName}` })));
  readonly prescriptionOptions = computed<GwSelectOption[]>(() =>
    this.prescriptions().map(p => ({ value: p.id, label: `${p.diagnosis || 'Prescription'} · ${new Date(p.createdAt).toLocaleDateString()}` })));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: (r) => { this.encounter.set(r.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load encounter'); },
    });
  }

  reload() { const e = this.encounter(); if (e) this.load(e.id); }

  // ─── Role / stage gating ───────────────────────────────────────────────────
  private get myId() { return this.auth.user()?.id; }
  private get myRole() { return this.auth.role(); }
  private inRole(...roles: string[]) { const r = this.myRole; return !!r && roles.includes(r); }

  /** The single action this role can take at the current stage, or null. */
  readonly myAction = computed<{ label: string; icon: string; kind: ModalKind | 'start' } | null>(() => {
    const e = this.encounter();
    if (!e) return null;
    switch (e.stage) {
      case 'awaiting_consult':
        if (this.canDoctor(e)) return { label: 'Start Consultation', icon: 'stethoscope', kind: 'start' };
        return null;
      case 'in_consultation':
        if (this.canDoctor(e)) return { label: 'Record Disposition', icon: 'clipboard-check', kind: 'disposition' };
        return null;
      case 'checkout':
        if (this.inRole('receptionist', 'billing_staff', 'admin', 'super_admin')) return { label: 'Checkout & Close', icon: 'receipt', kind: 'checkout' };
        return null;
      case 'admission_form':
        if (this.inRole('receptionist', 'nursing', 'admin', 'super_admin')) return { label: 'Fill Admission Form', icon: 'clipboard-list', kind: 'admission' };
        return null;
      case 'counter':
        if (this.inRole('receptionist', 'billing_staff', 'admin', 'super_admin')) return { label: 'Generate Case File', icon: 'receipt', kind: 'casefile' };
        return null;
      case 'nurse_assignment':
        if (this.inRole('matron', 'admin', 'super_admin')) return { label: 'Assign Nurse', icon: 'user-check', kind: 'nurse' };
        return null;
      case 'medication':
        if (this.canNurse(e)) return { label: 'Order Medication', icon: 'pill', kind: 'medication' };
        return null;
      default:
        return null;
    }
  });

  private canDoctor(e: PatientEncounter): boolean {
    if (this.inRole('admin', 'super_admin')) return true;
    return this.inRole('doctor', 'consultant', 'rmo') && e.assignedDoctorId === this.myId;
  }
  private canNurse(e: PatientEncounter): boolean {
    if (this.inRole('admin', 'super_admin')) return true;
    return this.inRole('nursing') && e.assignedNurseId === this.myId;
  }

  /** Only link to the IPD admission for roles that can actually open IPD pages. */
  readonly canViewIpd = computed(() => this.appMeta.canDo('ipd', 'canView'));

  readonly canCancel = computed(() => {
    const e = this.encounter();
    if (!e) return false;
    if (['closed', 'discharged', 'cancelled'].includes(e.stage)) return false;
    return this.inRole('receptionist', 'admin', 'super_admin') || this.canDoctor(e);
  });

  // ─── Action triggers ────────────────────────────────────────────────────────
  runAction() {
    const a = this.myAction();
    if (!a) return;
    if (a.kind === 'start') { this.startConsult(); return; }
    this.openModal(a.kind as ModalKind);
  }

  openModal(kind: ModalKind) {
    const e = this.encounter();
    if (!e) return;
    if (kind === 'admission') {
      this.admForm = { admissionDiagnosis: e.admissionDiagnosis || e.chiefComplaint || '', attendantName: '', attendantPhone: '', attendantRelation: '' };
    }
    if (kind === 'casefile') {
      this.caseForm = { payerType: 'cash', wardId: '', bedId: '', admissionType: 'emergency' };
      this.availableBeds.set([]);
    }
    if (kind === 'nurse') {
      this.nurseForm = { nurseId: '', handoverNotes: '' };
      this.svc.nurses().subscribe({ next: (r) => this.nurses.set(r.data ?? []) });
    }
    if (kind === 'checkout') {
      this.checkoutForm = { amount: null, paymentMode: 'cash', note: '' };
    }
    if (kind === 'medication') {
      this.medForm = { pharmacyType: 'in_house', prescriptionId: e.prescriptionId || '' };
      this.medItems.set([]);
      this.prescSvc.list({ patientId: e.patientId, limit: 20 }).subscribe({
        next: (r: any) => {
          this.prescriptions.set(r.data ?? []);
          if (e.prescriptionId) this.loadPrescriptionItems(e.prescriptionId);
        },
      });
    }
    this.modal.set(kind);
  }

  closeModal() { this.modal.set(null); }

  startConsult() {
    const e = this.encounter(); if (!e || this.busy()) return;
    this.busy.set(true);
    this.svc.startConsult(e.id).subscribe({
      next: () => { this.busy.set(false); this.toast.success('Consultation started'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  submitDisposition() {
    const e = this.encounter(); if (!e || this.busy()) return;
    this.busy.set(true);
    this.svc.setDisposition(e.id, { disposition: this.dispForm.disposition as any, note: this.dispForm.note || undefined }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Disposition recorded'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  submitAdmission() {
    const e = this.encounter(); if (!e || this.busy()) return;
    if (!this.admForm.admissionDiagnosis.trim()) { this.toast.error('Enter the diagnosis'); return; }
    this.busy.set(true);
    this.svc.fillAdmissionForm(e.id, {
      admissionDiagnosis: this.admForm.admissionDiagnosis,
      attendantName: this.admForm.attendantName || undefined,
      attendantPhone: this.admForm.attendantPhone || undefined,
      attendantRelation: this.admForm.attendantRelation || undefined,
    }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Admission form saved'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  onWardChange(wardId: string) {
    this.caseForm.wardId = wardId;
    this.caseForm.bedId = '';
    if (!wardId) { this.availableBeds.set([]); return; }
    this.ipdSvc.getAvailableBeds(wardId).subscribe({ next: (r: any) => this.availableBeds.set(r.data ?? []) });
  }

  submitCaseFile() {
    const e = this.encounter(); if (!e || this.busy()) return;
    if (!this.caseForm.bedId) { this.toast.error('Select a bed'); return; }
    this.busy.set(true);
    this.svc.generateCaseFile(e.id, {
      payerType: this.caseForm.payerType,
      bedId: this.caseForm.bedId,
      admissionType: this.caseForm.admissionType,
    }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Case file generated — patient admitted'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  submitNurse() {
    const e = this.encounter(); if (!e || this.busy()) return;
    if (!this.nurseForm.nurseId) { this.toast.error('Select a nurse'); return; }
    this.busy.set(true);
    this.svc.assignNurse(e.id, { nurseId: this.nurseForm.nurseId, handoverNotes: this.nurseForm.handoverNotes || undefined }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Nurse assigned'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  loadPrescriptionItems(prescriptionId: string) {
    this.medForm.prescriptionId = prescriptionId;
    if (!prescriptionId) { this.medItems.set([]); return; }
    this.prescSvc.get(prescriptionId).subscribe({
      next: (r: any) => {
        const meds = r.data?.medicines ?? [];
        this.medItems.set(meds.map((m: any) => ({
          prescriptionMedicineId: m.id,
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          prescribedQty: 0,
          isBillable: true,
        })));
      },
    });
  }

  addMedItem() {
    this.medItems.update(items => [...items, { medicineName: '', prescribedQty: 0, isBillable: true }]);
  }
  removeMedItem(i: number) {
    this.medItems.update(items => items.filter((_, idx) => idx !== i));
  }

  submitMedication() {
    const e = this.encounter(); if (!e || this.busy()) return;
    const items = this.medItems().filter(i => i.medicineName?.trim());
    if (!items.length) { this.toast.error('Add at least one medicine'); return; }
    this.busy.set(true);
    this.svc.orderMedication(e.id, {
      pharmacyType: this.medForm.pharmacyType,
      prescriptionId: this.medForm.prescriptionId || undefined,
      items,
    }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Medication ordered — pharmacy notified'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  submitCheckout() {
    const e = this.encounter(); if (!e || this.busy()) return;
    this.busy.set(true);
    this.svc.checkout(e.id, {
      amount: this.checkoutForm.amount ?? undefined,
      paymentMode: this.checkoutForm.paymentMode || undefined,
      note: this.checkoutForm.note || undefined,
    }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Checked out — visit closed'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  submitCancel() {
    const e = this.encounter(); if (!e || this.busy()) return;
    this.busy.set(true);
    this.svc.cancel(e.id, this.dispForm.note || undefined).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Encounter cancelled'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  // ─── Display helpers ─────────────────────────────────────────────────────
  back() { this.router.navigate(['/journey']); }

  stageVariant(stage: EncounterStage): GwBadgeVariant {
    const m: Record<string, GwBadgeVariant> = {
      registered: 'neutral', awaiting_consult: 'info', in_consultation: 'primary',
      checkout: 'warning', closed: 'success', admission_form: 'warning', counter: 'warning',
      nurse_assignment: 'purple', medication: 'primary', in_care: 'success',
      discharged: 'neutral', cancelled: 'danger',
    };
    return m[stage] ?? 'neutral';
  }

  payerLabel(p?: PayerType | null): string {
    if (!p) return '';
    return p === 'pmjay' ? 'PMJAY' : p === 'cashless' ? 'Cashless' : 'Cash';
  }

  age(dob?: string): string {
    if (!dob) return '';
    const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
    return `${years}y`;
  }

  eventTitle(ev: EncounterEvent): string {
    const map: Record<string, string> = {
      REGISTERED: 'Patient registered',
      CONSULT_STARTED: 'Consultation started',
      DISPOSITION_SET: 'Disposition recorded',
      ADMISSION_FORM_FILLED: 'Admission form filled',
      CASE_FILE_GENERATED: 'Case file generated · patient admitted',
      NURSE_ASSIGNED: 'Nurse assigned',
      PHARMACY_ORDERED: 'Medication ordered',
      CHECKED_OUT: 'Checked out · visit closed',
      CANCELLED: 'Encounter cancelled',
    };
    return map[ev.action] ?? ev.action;
  }

  eventTone(ev: EncounterEvent): GwTimelineItemTone {
    if (ev.action === 'CANCELLED') return 'danger';
    if (ev.action === 'CASE_FILE_GENERATED' || ev.action === 'PHARMACY_ORDERED') return 'success';
    if (ev.action === 'DISPOSITION_SET') return 'primary';
    return 'neutral';
  }

  actorName(ev: EncounterEvent): string {
    if (ev.actor) return `${ev.actor.firstName} ${ev.actor.lastName}`;
    return ev.actorRole ?? 'System';
  }

  printSlip() {
    const e = this.encounter(); if (!e) return;
    const p = e.patient;
    const win = window.open('', '_blank', 'width=420,height=640');
    if (!win) { this.toast.error('Allow pop-ups to print the slip'); return; }
    win.document.write(`
      <html><head><title>Slip ${e.encounterNumber}</title>
      <style>
        body{font-family:Inter,Arial,sans-serif;padding:24px;color:#18181b}
        h1{font-size:16px;margin:0 0 4px} .muted{color:#71717a;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
        td{padding:6px 0;border-bottom:1px solid #e4e4e7} td:first-child{color:#71717a;width:42%}
        .tag{display:inline-block;padding:2px 8px;border:1px solid #d4d4d8;border-radius:4px;font-size:12px;margin-top:12px}
      </style></head><body>
        <h1>Patient Slip</h1>
        <div class="muted">${e.encounterNumber} · ${new Date(e.createdAt).toLocaleString()}</div>
        <table>
          <tr><td>Patient</td><td>${p?.firstName ?? ''} ${p?.lastName ?? ''}</td></tr>
          <tr><td>UHID</td><td>${p?.patientCode ?? '—'}</td></tr>
          <tr><td>Phone</td><td>${p?.phone ?? '—'}</td></tr>
          <tr><td>Chief complaint</td><td>${e.chiefComplaint}</td></tr>
          <tr><td>Urgency</td><td>${e.urgency}</td></tr>
          <tr><td>Routed to</td><td>${e.assignedDoctor ? 'Dr. ' + e.assignedDoctor.firstName + ' ' + e.assignedDoctor.lastName : '—'}</td></tr>
          <tr><td>Disposition</td><td>${e.disposition ?? '—'}</td></tr>
        </table>
        <div class="tag">Take this slip to the counter</div>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }
}
