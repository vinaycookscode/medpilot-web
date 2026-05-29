import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { PrescriptionsService } from '../../core/services/prescriptions.service';
import { PatientsService } from '../../core/services/patients.service';
import { Prescription, Medicine, CreatePrescriptionDto, PrescriptionMedicineDto, PrescriptionTestDto } from '../../core/models/prescription.models';
import { Patient } from '../../core/models/patient.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwIconButtonComponent } from '../../shared/ui/buttons/icon-button/icon-button.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwDateInputComponent } from '../../shared/ui/forms/date-input/date-input.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, ReactiveFormsModule, IconsModule,
    GwButtonComponent, GwIconButtonComponent,
    GwFormFieldComponent, GwInputComponent, GwTextareaComponent, GwDateInputComponent,
    GwDialogComponent,
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.scss',
})
export class PrescriptionsComponent implements OnInit {
  private rxSvc       = inject(PrescriptionsService);
  private patientsSvc = inject(PatientsService);
  private toast       = inject(ToastService);
  readonly auth       = inject(AuthService);
  private appMeta     = inject(AppMetaService);
  private fb          = inject(FormBuilder);

  readonly canCreate  = computed(() => this.appMeta.canDo('prescriptions', 'canCreate'));

  readonly dosageFrequencies = this.appMeta.dosageFrequencies;
  readonly medicineUnits     = this.appMeta.medicineUnits;
  readonly medicineRoutes    = this.appMeta.medicineRoutes;

  readonly prescriptions = signal<Prescription[]>([]);
  readonly total         = signal(0);
  readonly loading       = signal(true);
  readonly saving        = signal(false);
  readonly showCreate    = signal(false);
  readonly showDetail    = signal<Prescription | null>(null);
  readonly page          = signal(1);
  readonly pageSize      = 20;

  // Patient search
  readonly patientResults   = signal<Patient[]>([]);
  readonly selectedPatient  = signal<Patient | null>(null);
  readonly showPatientDrop  = signal(false);
  private patSearch$ = new Subject<string>();

  // Diagnosis autocomplete
  readonly diagnosisSuggestions = signal<string[]>([]);
  readonly showDiagnosisDrop    = signal(false);
  private diagSearch$ = new Subject<string>();

  // Medicine autocomplete
  readonly medicineResults = signal<Medicine[]>([]);
  readonly activeMedIndex  = signal<number | null>(null);
  private medSearch$ = new Subject<{ q: string; idx: number }>();

  // Test autocomplete
  readonly testSuggestions  = signal<string[]>([]);
  readonly activeTestIndex  = signal<number | null>(null);
  private testSearch$ = new Subject<{ q: string; idx: number }>();

  readonly form = this.fb.nonNullable.group({
    patientId:       ['', Validators.required],
    diagnosis:       ['', Validators.required],
    chiefComplaint:  [''],
    examinationNotes:[''],
    advice:          [''],
    followUpDate:    [''],
    followUpNotes:   [''],
    medicines: this.fb.array([]),
    tests:     this.fb.array([]),
  });

  get medicines() { return this.form.get('medicines') as FormArray; }
  get tests()     { return this.form.get('tests')     as FormArray; }

  ngOnInit() {
    this.load();

    this.patSearch$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length < 2) { this.patientResults.set([]); return; }
      this.patientsSvc.list({ search: q, limit: 6 }).subscribe(r => {
        this.patientResults.set(r.data);
        this.showPatientDrop.set(r.data.length > 0);
      });
    });

    this.diagSearch$.pipe(debounceTime(200), distinctUntilChanged()).subscribe(q => {
      if (q.length < 2) { this.diagnosisSuggestions.set([]); this.showDiagnosisDrop.set(false); return; }
      this.rxSvc.suggestDiagnoses(q).subscribe(r => {
        this.diagnosisSuggestions.set(r.data);
        this.showDiagnosisDrop.set(r.data.length > 0);
      });
    });

    this.medSearch$.pipe(debounceTime(250), distinctUntilChanged((a, b) => a.q === b.q && a.idx === b.idx))
      .subscribe(({ q, idx }) => {
        if (q.length < 2) { this.medicineResults.set([]); return; }
        this.activeMedIndex.set(idx);
        this.rxSvc.searchMedicines(q).subscribe(r => this.medicineResults.set(r.data));
      });

    this.testSearch$.pipe(debounceTime(200), distinctUntilChanged((a, b) => a.q === b.q && a.idx === b.idx))
      .subscribe(({ q, idx }) => {
        if (q.length < 2) { this.testSuggestions.set([]); return; }
        this.activeTestIndex.set(idx);
        this.rxSvc.suggestTests(q).subscribe(r => this.testSuggestions.set(r.data));
      });
  }

  load() {
    this.loading.set(true);
    this.rxSvc.list({ page: this.page(), limit: this.pageSize }).subscribe({
      next: r => { this.prescriptions.set(r.data); this.total.set(r.meta.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Patient search ──
  onPatientSearch(event: Event) {
    this.patSearch$.next((event.target as HTMLInputElement).value);
  }

  selectPatient(p: Patient) {
    this.selectedPatient.set(p);
    this.form.patchValue({ patientId: p.id });
    this.patientResults.set([]);
    this.showPatientDrop.set(false);
  }

  clearPatient() { this.selectedPatient.set(null); this.form.patchValue({ patientId: '' }); }

  // ── Diagnosis autocomplete ──
  onDiagnosisInput(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.diagSearch$.next(q);
  }

  selectDiagnosis(text: string) {
    this.form.patchValue({ diagnosis: text });
    this.diagnosisSuggestions.set([]);
    this.showDiagnosisDrop.set(false);
  }

  closeDiagnosisDrop() { this.showDiagnosisDrop.set(false); }

  // ── Medicines ──
  addMedicine() {
    this.medicines.push(this.fb.nonNullable.group({
      medicineName: ['', Validators.required],
      dosage:       ['', Validators.required],
      frequency:    ['', Validators.required],
      duration:     ['', Validators.required],
      timing:       [''],
      instructions: [''],
    }));
  }

  removeMedicine(i: number) {
    this.medicines.removeAt(i);
    if (this.activeMedIndex() === i) this.medicineResults.set([]);
  }

  onMedicineNameInput(event: Event, idx: number) {
    const q = (event.target as HTMLInputElement).value;
    this.medSearch$.next({ q, idx });
  }

  selectMedicine(med: Medicine, idx: number) {
    this.medicines.at(idx).patchValue({ medicineName: med.name });
    this.medicineResults.set([]);
    this.activeMedIndex.set(null);
  }

  // ── Tests ──
  addTest() {
    this.tests.push(this.fb.nonNullable.group({
      testName:     ['', Validators.required],
      instructions: [''],
    }));
  }

  removeTest(i: number) {
    this.tests.removeAt(i);
    if (this.activeTestIndex() === i) this.testSuggestions.set([]);
  }

  onTestNameInput(event: Event, idx: number) {
    const q = (event.target as HTMLInputElement).value;
    this.testSearch$.next({ q, idx });
  }

  selectTest(name: string, idx: number) {
    this.tests.at(idx).patchValue({ testName: name });
    this.testSuggestions.set([]);
    this.activeTestIndex.set(null);
  }

  // ── Modal ──
  openCreate() {
    this.form.reset();
    this.medicines.clear();
    this.tests.clear();
    this.selectedPatient.set(null);
    this.diagnosisSuggestions.set([]);
    this.addMedicine();
    this.showCreate.set(true);
  }

  closeCreate() { this.showCreate.set(false); }

  openDetail(rx: Prescription) {
    this.rxSvc.get(rx.id).subscribe(r => this.showDetail.set(r.data));
  }

  closeDetail() { this.showDetail.set(null); }

  save() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const body: CreatePrescriptionDto = {
      patientId:        raw.patientId,
      diagnosis:        raw.diagnosis,
      ...(raw.chiefComplaint   && { chiefComplaint: raw.chiefComplaint }),
      ...(raw.examinationNotes && { examinationNotes: raw.examinationNotes }),
      ...(raw.advice           && { advice: raw.advice }),
      ...(raw.followUpDate     && { followUpDate: raw.followUpDate }),
      ...(raw.followUpNotes    && { followUpNotes: raw.followUpNotes }),
      medicines: (raw.medicines as any[]).filter(m => m.medicineName) as PrescriptionMedicineDto[],
      tests:     (raw.tests as any[]).filter(t => t.testName) as PrescriptionTestDto[],
    };

    this.rxSvc.create(body).subscribe({
      next: r => {
        this.prescriptions.update(ps => [r.data, ...ps]);
        this.total.update(t => t + 1);
        this.saving.set(false);
        this.showCreate.set(false);
        this.toast.success('Prescription created');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to create prescription');
      },
    });
  }

  isDoctor() { return this.auth.hasRole('doctor'); }

  get totalPages() { return Math.ceil(this.total() / this.pageSize); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.load(); } }
}
