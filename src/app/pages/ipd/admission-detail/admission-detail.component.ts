import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconsModule } from '../../../shared/icons';
import { IpdService } from '../../../core/services/ipd.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppMetaService } from '../../../core/services/app-meta.service';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './admission-detail.component.html',
  styleUrl: './admission-detail.component.scss',
})
export class AdmissionDetailComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private ipdSvc   = inject(IpdService);
  private toast    = inject(ToastService);
  readonly auth    = inject(AuthService);
  readonly appMeta = inject(AppMetaService);
  private fb       = inject(FormBuilder);

  readonly admission  = signal<IpdAdmission | null>(null);
  readonly notes      = signal<IpdDailyNote[]>([]);
  readonly charges    = signal<IpdCharge[]>([]);
  readonly chargeTotal = signal(0);
  readonly procedures = signal<IpdProcedure[]>([]);
  readonly loading    = signal(true);
  readonly tab        = signal<DetailTab>('notes');

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

  // Charge form
  readonly chargeModal  = signal(false);
  readonly chargeSaving = signal(false);
  readonly chargeForm = this.fb.nonNullable.group({
    chargeDate:   [this.todayStr()],
    chargeType:   ['service', Validators.required],
    departmentId: ['' as string],
    description:  ['', Validators.required],
    quantity:     [1, [Validators.required, Validators.min(0.001)]],
    unitPrice:    [0, [Validators.required, Validators.min(0)]],
    notes:        [''],
  });

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
        this.admission.set((admission as any).data);
        this.notes.set((notes as any).data ?? []);
        const cd = (charges as any).data ?? {};
        this.charges.set(cd.charges ?? []);
        this.chargeTotal.set(cd.total ?? 0);
        this.procedures.set((procedures as any).data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  reload() { const id = this.admission()?.id; if (id) this.loadAll(id); }

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
    this.chargeForm.reset({ chargeDate: this.todayStr(), chargeType: 'service', quantity: 1, unitPrice: 0 });
    this.chargeModal.set(true);
  }

  saveCharge() {
    if (this.chargeForm.invalid || this.chargeSaving()) return;
    this.chargeSaving.set(true);
    const v = this.chargeForm.getRawValue();
    const dto: AddChargeDto = {
      chargeDate:   v.chargeDate || undefined,
      chargeType:   v.chargeType as ChargeType,
      departmentId: v.departmentId || undefined,
      description:  v.description,
      quantity:     v.quantity,
      unitPrice:    v.unitPrice,
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
