import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { PatientsService } from '../../core/services/patients.service';
import { ToastService } from '../../core/services/toast.service';
import {
  EncountersService, PatientEncounter, EncounterStats, EncounterStage,
  STAGE_LABELS, EncounterUrgency, VisitType,
} from '../../core/services/encounters.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../shared/ui/display/badge/badge.component';
import { GwTableComponent, GwTableColumn } from '../../shared/ui/data/table/table.component';
import { GwCellDirective } from '../../shared/ui/data/table/cell.directive';
import { GwStatCardComponent } from '../../shared/ui/data/stat-card/stat-card.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwSelectComponent, GwSelectOption } from '../../shared/ui/forms/select/select.component';
import { GwSegmentedComponent, GwSegmentOption } from '../../shared/ui/forms/segmented/segmented.component';
import { GwSearchInputComponent } from '../../shared/ui/forms/search-input/search-input.component';
import { GwEmptyStateComponent } from '../../shared/ui/display/empty-state/empty-state.component';

type Scope = 'mine' | 'all';

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwTableComponent, GwCellDirective,
    GwStatCardComponent, GwDialogComponent, GwFormFieldComponent, GwInputComponent,
    GwTextareaComponent, GwSelectComponent, GwSegmentedComponent, GwSearchInputComponent,
    GwEmptyStateComponent,
  ],
  templateUrl: './journey.component.html',
  styleUrl: './journey.component.scss',
})
export class JourneyComponent implements OnInit {
  private svc = inject(EncountersService);
  private patientsSvc = inject(PatientsService);
  private appMeta = inject(AppMetaService);
  private toast = inject(ToastService);
  private router = inject(Router);
  readonly auth = inject(AuthService);

  readonly rows = signal<PatientEncounter[]>([]);
  readonly stats = signal<EncounterStats | null>(null);
  readonly loading = signal(true);
  readonly scope = signal<Scope>('mine');

  readonly canIntake = computed(() => this.appMeta.canDo('encounters', 'canCreate'));

  stageLabel(s: string): string { return STAGE_LABELS[s as EncounterStage] ?? s; }

  readonly scopeOptions: GwSegmentOption[] = [
    { value: 'mine', label: 'My Worklist' },
    { value: 'all', label: 'All Journeys' },
  ];

  readonly columns: GwTableColumn[] = [
    { key: 'encounterNumber', label: 'Encounter', width: '130px' },
    { key: 'patient', label: 'Patient' },
    { key: 'chiefComplaint', label: 'Complaint', truncate: true },
    { key: 'stage', label: 'Stage', width: '160px' },
    { key: 'urgency', label: 'Urgency', width: '110px' },
    { key: 'waiting', label: 'Waiting', width: '120px' },
    { key: 'action', label: '', width: '100px', align: 'right' },
  ];

  // ─── Intake modal state ──────────────────────────────────────────────────
  readonly intakeOpen = signal(false);
  readonly saving = signal(false);
  readonly patientResults = signal<any[]>([]);
  readonly selectedPatient = signal<any | null>(null);
  readonly newPatientMode = signal(false);

  form = this.blankForm();
  newPatient = { firstName: '', lastName: '', phone: '', gender: '' };

  readonly urgencyOptions: GwSegmentOption[] = [
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' },
  ];
  readonly visitOptions: GwSegmentOption[] = [
    { value: 'opd', label: 'OPD' },
    { value: 'emergency', label: 'Emergency' },
  ];
  readonly genderOptions: GwSelectOption[] = [
    { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' },
  ];

  readonly doctorOptions = computed<GwSelectOption[]>(() =>
    this.appMeta.doctors().map(d => ({ value: d.id, label: `Dr. ${d.name}${d.specialization ? ' · ' + d.specialization : ''}` })));
  readonly departmentOptions = computed<GwSelectOption[]>(() =>
    this.appMeta.departments().map(d => ({ value: d.name, label: d.name })));

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const source$ = this.scope() === 'mine' ? this.svc.myWorklist() : this.svc.list({ activeOnly: 'true' });
    source$.subscribe({
      next: (r) => { this.rows.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.svc.stats().subscribe({ next: (r) => this.stats.set(r.data) });
  }

  setScope(s: Scope) { this.scope.set(s); this.load(); }

  open(e: PatientEncounter) { this.router.navigate(['/journey', e.id]); }

  stageVariant(stage: EncounterStage): GwBadgeVariant {
    const m: Record<string, GwBadgeVariant> = {
      registered: 'neutral', awaiting_consult: 'info', in_consultation: 'primary',
      checkout: 'warning', closed: 'success', admission_form: 'warning', counter: 'warning',
      nurse_assignment: 'purple', medication: 'primary', in_care: 'success',
      discharged: 'neutral', cancelled: 'danger',
    };
    return m[stage] ?? 'neutral';
  }

  urgencyVariant(u: EncounterUrgency): GwBadgeVariant {
    return u === 'emergency' ? 'danger' : u === 'urgent' ? 'warning' : 'neutral';
  }

  waitingSince(iso: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    return h < 24 ? `${h}h ${mins % 60}m` : `${Math.floor(h / 24)}d`;
  }

  // ─── Intake ────────────────────────────────────────────────────────────────
  openIntake() {
    this.form = this.blankForm();
    this.newPatient = { firstName: '', lastName: '', phone: '', gender: '' };
    this.selectedPatient.set(null);
    this.patientResults.set([]);
    this.newPatientMode.set(false);
    this.intakeOpen.set(true);
  }

  searchPatients(q: string) {
    if (!q || q.length < 2) { this.patientResults.set([]); return; }
    this.patientsSvc.list({ search: q, limit: 8 }).subscribe({
      next: (r: any) => this.patientResults.set(r.data ?? []),
    });
  }

  pickPatient(p: any) {
    this.selectedPatient.set(p);
    this.patientResults.set([]);
  }

  clearPatient() { this.selectedPatient.set(null); }

  toggleNewPatient() {
    this.newPatientMode.set(!this.newPatientMode());
    this.selectedPatient.set(null);
    this.patientResults.set([]);
  }

  submitIntake() {
    if (this.saving()) return;
    if (!this.form.assignedDoctorId) { this.toast.error('Select a doctor to route to'); return; }
    if (!this.form.chiefComplaint?.trim()) { this.toast.error('Enter the chief complaint'); return; }

    this.saving.set(true);
    if (this.newPatientMode()) {
      const np = this.newPatient;
      if (!np.firstName || !np.lastName || !np.phone) {
        this.saving.set(false);
        this.toast.error('New patient needs first name, last name and phone');
        return;
      }
      this.patientsSvc.create({
        firstName: np.firstName, lastName: np.lastName, phone: np.phone,
        gender: np.gender || undefined,
      } as any).subscribe({
        next: (r: any) => this.doRegister(r.data.id),
        error: (err) => { this.saving.set(false); this.toast.error(err?.error?.message ?? 'Failed to create patient'); },
      });
    } else {
      const p = this.selectedPatient();
      if (!p) { this.saving.set(false); this.toast.error('Select or create a patient'); return; }
      this.doRegister(p.id);
    }
  }

  private doRegister(patientId: string) {
    this.svc.register({
      patientId,
      chiefComplaint: this.form.chiefComplaint,
      urgency: this.form.urgency as EncounterUrgency,
      visitType: this.form.visitType as VisitType,
      assignedDoctorId: this.form.assignedDoctorId,
      department: this.form.department || undefined,
    }).subscribe({
      next: (r) => {
        this.saving.set(false);
        this.intakeOpen.set(false);
        this.toast.success('Patient registered — routed to doctor');
        this.router.navigate(['/journey', r.data.id]);
      },
      error: (err) => { this.saving.set(false); this.toast.error(err?.error?.message ?? 'Failed to register'); },
    });
  }

  private blankForm() {
    return { chiefComplaint: '', urgency: 'routine', visitType: 'opd', assignedDoctorId: '', department: '' };
  }
}
