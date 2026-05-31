import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { IconsModule } from '../../../shared/icons';
import { IpdService } from '../../../core/services/ipd.service';
import { EncountersService, PatientEncounter } from '../../../core/services/encounters.service';
import { DischargeService, DischargeMedication, ChargeSummary } from '../../../core/services/discharge.service';
import { ChargeMasterService, ChargeMasterLookupItem } from '../../../core/services/charge-master.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppMetaService } from '../../../core/services/app-meta.service';
import { GwDialogComponent } from '../../../shared/ui/overlays/dialog/dialog.component';
import { GwFormFieldComponent } from '../../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../../shared/ui/forms/input/input.component';
import { GwSelectComponent } from '../../../shared/ui/forms/select/select.component';
import { GwTextareaComponent } from '../../../shared/ui/forms/textarea/textarea.component';
import { GwButtonComponent } from '../../../shared/ui/buttons/button/button.component';
import { GwStatCardComponent } from '../../../shared/ui/data/stat-card/stat-card.component';
import { GwBadgeComponent } from '../../../shared/ui/display/badge/badge.component';
import { GwTableComponent, GwTableColumn } from '../../../shared/ui/data/table/table.component';
import { GwCellDirective } from '../../../shared/ui/data/table/cell.directive';
import {
  IpdAdmission, IpdDailyNote, IpdCharge, IpdProcedure,
  DischargePatientDto, CreateDailyNoteDto, AddChargeDto,
  NoteVitals, ChargeType, NoteType,
} from '../../../core/models/ipd.models';
import { forkJoin } from 'rxjs';

type DetailTab = 'notes' | 'charges' | 'procedures' | 'summary';

@Component({
  selector: 'app-admission-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IconsModule, RouterLink,
    GwDialogComponent, GwFormFieldComponent, GwInputComponent, GwSelectComponent, GwTextareaComponent, GwButtonComponent,
    GwStatCardComponent, GwBadgeComponent, GwTableComponent, GwCellDirective,
  ],
  templateUrl: './admission-detail.component.html',
  styleUrl: './admission-detail.component.scss',
})
export class AdmissionDetailComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private ipdSvc   = inject(IpdService);
  private encSvc   = inject(EncountersService);
  private dischargeSvc = inject(DischargeService);
  private chargeMasterSvc = inject(ChargeMasterService);
  private toast    = inject(ToastService);
  readonly auth    = inject(AuthService);
  readonly appMeta = inject(AppMetaService);

  // ─── Initiate staged discharge (consultant/doctor) ───────────────────────
  readonly initiateModal  = signal(false);
  readonly initiateSaving = signal(false);
  initiateForm = { dischargeAdvice: '' };
  initiateMeds: DischargeMedication[] = [];

  readonly canInitiateDischarge = computed(() => {
    const r = this.auth.role();
    return !!r && ['consultant', 'doctor', 'admin', 'super_admin'].includes(r);
  });
  // Charges are posted by front-office/billing — mirror the backend POST :id/charges guard.
  readonly canAddCharge = computed(() => {
    const r = this.auth.role();
    return !!r && ['admin', 'receptionist', 'super_admin'].includes(r);
  });

  openInitiateDischarge() {
    this.initiateForm = { dischargeAdvice: '' };
    this.initiateMeds = [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }];
    this.initiateModal.set(true);
  }
  addInitiateMed() { this.initiateMeds = [...this.initiateMeds, { name: '', dose: '', frequency: '', duration: '', instructions: '' }]; }
  removeInitiateMed(i: number) { this.initiateMeds = this.initiateMeds.filter((_, idx) => idx !== i); }

  submitInitiateDischarge() {
    const adm = this.admission();
    if (!adm || this.initiateSaving()) return;
    this.initiateSaving.set(true);
    const meds = this.initiateMeds.filter(m => m.name?.trim());
    this.dischargeSvc.initiate({
      admissionId: adm.id,
      dischargeAdvice: this.initiateForm.dischargeAdvice || undefined,
      dischargeMedications: meds.length ? meds : undefined,
    }).subscribe({
      next: (r) => {
        this.initiateSaving.set(false);
        this.initiateModal.set(false);
        this.toast.show('Discharge initiated — routed to RMO', 'success');
        this.router.navigate(['/discharge', r.data.id]);
      },
      error: (err) => { this.initiateSaving.set(false); this.toast.error(err?.error?.message ?? 'Failed to initiate discharge'); },
    });
  }
  private fb       = inject(FormBuilder);

  readonly admission  = signal<IpdAdmission | null>(null);
  readonly notes      = signal<IpdDailyNote[]>([]);
  readonly charges    = signal<IpdCharge[]>([]);
  readonly chargeTotal = signal(0);
  readonly procedures = signal<IpdProcedure[]>([]);
  readonly loading    = signal(true);
  readonly tab        = signal<DetailTab>('notes');
  /** Consolidated charges-till-date (IPD + investigations + pharmacy + consultation). */
  readonly chargeSummary = signal<ChargeSummary | null>(null);
  /** Consolidated total if available, else the IPD-only total. */
  readonly chargesTillDate = computed(() => this.chargeSummary()?.grandTotal ?? this.chargeTotal());

  readonly chargeColumns: GwTableColumn[] = [
    { key: 'chargeDate', label: 'Date', width: '90px' },
    { key: 'chargeType', label: 'Type', width: '120px' },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Qty', width: '60px', align: 'right' },
    { key: 'unitPrice', label: 'Rate', width: '100px', align: 'right' },
    { key: 'totalAmount', label: 'Amount', width: '110px', align: 'right' },
  ];
  readonly procedureColumns: GwTableColumn[] = [
    { key: 'procedureName', label: 'Procedure' },
    { key: 'performedBy', label: 'Performed by', width: '170px' },
    { key: 'performedAt', label: 'Date/Time', width: '160px' },
    { key: 'duration', label: 'Duration', width: '100px' },
    { key: 'amount', label: 'Amount', width: '110px', align: 'right' },
  ];

  catLabel(cat: string): string {
    const m: Record<string, string> = {
      room: 'Room', procedure: 'Procedures', medicine: 'Medicines', lab: 'Lab',
      nursing: 'Nursing', service: 'Services', other: 'Other', ot: 'OT',
      investigation: 'Investigations', pharmacy: 'Pharmacy', consultation: 'Consultation',
    };
    return m[cat] ?? (cat.charAt(0).toUpperCase() + cat.slice(1));
  }
  catIcon(cat: string): string {
    const m: Record<string, string> = {
      room: 'bed', procedure: 'activity', nursing: 'heart-pulse', service: 'package',
      investigation: 'scan-line', lab: 'flask-conical', pharmacy: 'pill', consultation: 'stethoscope',
    };
    return m[cat] ?? 'receipt';
  }
  /** Originating patient-journey encounter, if this admission came from one. */
  readonly linkedEncounter = signal<PatientEncounter | null>(null);

  // Note form
  readonly noteModal  = signal(false);
  readonly noteSaving = signal(false);
  noteVitals: NoteVitals = {};
  readonly noteForm = this.fb.nonNullable.group({
    noteDate:   [this.todayStr(), Validators.required],
    noteTime:   [this.nowTime(), Validators.required],
    noteType:   ['doctor_round'],
    subjective: [''],
    objective:  [''],
    assessment: [''],
    plan:       [''],
    notes:      [''],
    isPrivate:  [false],
  });

  // Charge form — priced from the super-admin charge master (serviceId is the source of truth)
  readonly chargeModal  = signal(false);
  readonly chargeSaving = signal(false);
  readonly masterItems  = signal<ChargeMasterLookupItem[]>([]);
  readonly masterLoading = signal(false);
  readonly selectedMaster = signal<ChargeMasterLookupItem | null>(null);
  readonly chargeForm = this.fb.nonNullable.group({
    chargeDate:   [this.todayStr()],
    serviceId:    ['', Validators.required],
    description:  ['', Validators.required],
    quantity:     [1, [Validators.required, Validators.min(0.001)]],
    notes:        [''],
  });

  /** charge-master category → IPD charge type (for the row badge; backend is authoritative). */
  private readonly CAT_TO_TYPE: Record<string, ChargeType> = {
    room: 'room', ot: 'procedure', procedure: 'procedure', investigation: 'lab',
    medicine: 'medicine', service: 'service', consultation: 'service', other: 'other',
  };

  /** Charge-master options, labelled with category, price and code (sorted by category server-side). */
  readonly masterOptions = computed(() => this.masterItems().map(m => ({
    value: m.id,
    label: `[${this.catLabel(m.category)}] ${m.name} — ${this.formatCurrency(m.basePrice)} · ${m.code}`,
  })));

  /** Live line total for the picked item × quantity. */
  chargeLineTotal(): number {
    const m = this.selectedMaster();
    const qty = Number(this.chargeForm.controls.quantity.value) || 0;
    return m ? +(m.basePrice * qty).toFixed(2) : 0;
  }

  onMasterSelect(id: string) {
    const m = this.masterItems().find(x => x.id === id) ?? null;
    this.selectedMaster.set(m);
    if (m) this.chargeForm.patchValue({ description: m.name });
  }

  // Discharge form
  readonly dischargeModal  = signal(false);
  readonly dischargeSaving = signal(false);
  dischargeMeds: { name: string; dose: string; frequency: string; duration: string; instructions: string }[] = [];
  readonly dischargeForm = this.fb.nonNullable.group({
    dischargeDate:         [this.todayStr(), Validators.required],
    dischargeTime:         [this.nowTime(), Validators.required],
    dischargeType:         ['recovered', Validators.required],
    finalDiagnosis:        ['', Validators.required],
    icd10Codes:            [''],
    conditionAtDischarge:  ['good', Validators.required],
    procedureSummary:      [''],
    investigationSummary:  [''],
    treatmentGiven:        [''],
    clinicalSummary:       ['', Validators.required],
    followUpDate:          [''],
    followUpInstructions:  [''],
  });

  readonly noteTypes      = this.appMeta.noteTypes;
  readonly chargeTypes    = this.appMeta.ipdChargeTypes;
  readonly dischargeTypes = this.appMeta.dischargeTypes;
  readonly conditions     = this.appMeta.patientConditions;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadAll(id);
    // Picking a charge-master item drives the rate + description (gw-select has no valueChange output).
    this.chargeForm.controls.serviceId.valueChanges.subscribe(sid => this.onMasterSelect(sid));
  }

  loadAll(id: string) {
    this.loading.set(true);
    forkJoin({
      admission:  this.ipdSvc.getAdmission(id),
      notes:      this.ipdSvc.getNotes(id),
      charges:    this.ipdSvc.getCharges(id),
      procedures: this.ipdSvc.getProcedures(id),
    }).subscribe({
      next: ({ admission, notes, charges, procedures }) => {
        const adm = (admission as any).data;
        this.admission.set(adm);
        this.notes.set((notes as any).data ?? []);
        const cd = (charges as any).data ?? {};
        this.charges.set(cd.charges ?? []);
        this.chargeTotal.set(cd.total ?? 0);
        this.procedures.set((procedures as any).data ?? []);
        this.loading.set(false);
        this.resolveJourney(adm);
        this.loadChargeSummary(id);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Live consolidated charges-till-date (best-effort; hidden if the role can't access it). */
  private loadChargeSummary(admissionId: string) {
    this.chargeSummary.set(null);
    this.dischargeSvc.chargeSummary(admissionId).subscribe({
      next: (r) => this.chargeSummary.set(r.data),
      error: () => {},
    });
  }

  reload() { const id = this.admission()?.id; if (id) this.loadAll(id); }

  /** Find the patient-journey encounter that produced this admission (best-effort). */
  private resolveJourney(adm: IpdAdmission | null) {
    this.linkedEncounter.set(null);
    const patientId = adm?.patient?.id ?? (adm as any)?.patientId;
    if (!patientId || !adm?.id) return;
    this.encSvc.getForPatient(patientId).subscribe({
      next: (r) => this.linkedEncounter.set((r.data ?? []).find(e => e.admissionId === adm.id) ?? null),
      error: () => {},
    });
  }

  // ─── Notes ───────────────────────────────────────────────────────────────

  openNoteModal() {
    this.noteForm.reset({ noteDate: this.todayStr(), noteTime: this.nowTime(), noteType: 'doctor_round', isPrivate: false });
    this.noteVitals = {};
    this.noteModal.set(true);
  }

  saveNote() {
    if (this.noteForm.invalid || this.noteSaving()) return;
    this.noteSaving.set(true);
    const v = this.noteForm.getRawValue();
    const dto: CreateDailyNoteDto = {
      noteDate:      v.noteDate,
      noteTime:      v.noteTime,
      noteType:      v.noteType as NoteType,
      subjective:    v.subjective || undefined,
      objective:     v.objective || undefined,
      assessment:    v.assessment || undefined,
      plan:          v.plan || undefined,
      vitalsSnapshot: Object.keys(this.noteVitals).length ? this.noteVitals : undefined,
      notes:         v.notes || undefined,
      isPrivate:     v.isPrivate,
    };
    this.ipdSvc.addNote(this.admission()!.id, dto).subscribe({
      next: r => {
        this.notes.update(ns => [r.data, ...ns]);
        this.noteModal.set(false);
        this.noteSaving.set(false);
        this.toast.success('Note added');
      },
      error: err => {
        this.noteSaving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save note');
      },
    });
  }

  // ─── Charges ─────────────────────────────────────────────────────────────

  openChargeModal() {
    this.chargeForm.reset({ chargeDate: this.todayStr(), serviceId: '', quantity: 1 });
    this.selectedMaster.set(null);
    this.chargeModal.set(true);
    if (!this.masterItems().length) {
      this.masterLoading.set(true);
      this.chargeMasterSvc.lookup().subscribe({
        next: items => { this.masterItems.set(items ?? []); this.masterLoading.set(false); },
        error: () => { this.masterLoading.set(false); this.toast.error('Could not load the charge master'); },
      });
    }
  }

  saveCharge() {
    if (this.chargeForm.invalid || this.chargeSaving()) return;
    const master = this.selectedMaster();
    if (!master) { this.toast.error('Pick a charge from the master'); return; }
    this.chargeSaving.set(true);
    const v = this.chargeForm.getRawValue();
    // Price + category come from the charge master on the server; we only send the link + qty.
    const dto: AddChargeDto = {
      chargeDate:   v.chargeDate || undefined,
      serviceId:    v.serviceId,
      chargeType:   this.CAT_TO_TYPE[master.category] ?? 'other',
      description:  v.description,
      quantity:     v.quantity,
      notes:        v.notes || undefined,
    };
    this.ipdSvc.addCharge(this.admission()!.id, dto).subscribe({
      next: r => {
        this.charges.update(cs => [...cs, r.data]);
        this.chargeTotal.update(t => t + r.data.totalAmount);
        this.chargeModal.set(false);
        this.chargeSaving.set(false);
        this.toast.success('Charge added');
      },
      error: err => {
        this.chargeSaving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to add charge');
      },
    });
  }

  // ─── Discharge ────────────────────────────────────────────────────────────

  openDischarge() {
    const a = this.admission()!;
    this.dischargeForm.reset({
      dischargeDate: this.todayStr(),
      dischargeTime: this.nowTime(),
      dischargeType: 'recovered',
      conditionAtDischarge: 'good',
      finalDiagnosis: a.admissionDiagnosis,
    });
    this.dischargeMeds = [];
    this.dischargeModal.set(true);
  }

  addDischargeMed() {
    this.dischargeMeds.push({ name: '', dose: '', frequency: '', duration: '', instructions: '' });
  }

  removeDischargeMed(i: number) { this.dischargeMeds.splice(i, 1); }

  discharge() {
    if (this.dischargeForm.invalid || this.dischargeSaving()) return;
    this.dischargeSaving.set(true);
    const v = this.dischargeForm.getRawValue();
    const dto: DischargePatientDto = {
      dischargeDate:        v.dischargeDate,
      dischargeTime:        v.dischargeTime,
      dischargeType:        v.dischargeType as any,
      finalDiagnosis:       v.finalDiagnosis,
      icd10Codes:           v.icd10Codes ? v.icd10Codes.split(',').map(s => s.trim()).filter(Boolean) : [],
      conditionAtDischarge: v.conditionAtDischarge as any,
      procedureSummary:     v.procedureSummary || undefined,
      investigationSummary: v.investigationSummary || undefined,
      treatmentGiven:       v.treatmentGiven || undefined,
      clinicalSummary:      v.clinicalSummary,
      dischargeMedications: this.dischargeMeds.filter(m => m.name.trim()),
      followUpDate:         v.followUpDate || undefined,
      followUpInstructions: v.followUpInstructions || undefined,
    };
    this.ipdSvc.discharge(this.admission()!.id, dto).subscribe({
      next: r => {
        this.admission.set(r.data);
        this.dischargeModal.set(false);
        this.dischargeSaving.set(false);
        this.toast.success('Patient discharged successfully');
      },
      error: err => {
        this.dischargeSaving.set(false);
        this.toast.error(err?.error?.message ?? 'Discharge failed');
      },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  noteTypeLabel(t: string) { return this.noteTypes().find(n => n.value === t)?.label ?? t; }
  noteTypeBadge(t: string) {
    const m: Record<string, string> = {
      doctor_round: 'badge--primary', nursing: 'badge--neutral',
      procedure_note: 'badge--warning', incident: 'badge--danger', handover: 'badge--neutral',
    };
    return m[t] ?? 'badge--neutral';
  }
  chargeTypeLabel(t: string) { return this.chargeTypes().find(c => c.value === t)?.label ?? t; }
  chargeTypeBadge(t: string) {
    const m: Record<string, string> = {
      room: 'badge--neutral', procedure: 'badge--warning', medicine: 'badge--primary',
      lab: 'badge--neutral', nursing: 'badge--neutral', service: 'badge--neutral', other: 'badge--neutral',
    };
    return m[t] ?? 'badge--neutral';
  }

  los(a: IpdAdmission) {
    const end = a.dischargeDate ? new Date(a.dischargeDate) : new Date();
    return Math.max(1, Math.ceil((end.getTime() - new Date(a.admissionDate).getTime()) / (1000 * 60 * 60 * 24)));
  }

  formatCurrency(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
  }

  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  isAdmitted() { return this.admission()?.status === 'admitted'; }
}
