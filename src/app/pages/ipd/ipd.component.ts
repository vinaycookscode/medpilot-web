import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { IpdService } from '../../core/services/ipd.service';
import { PatientsService } from '../../core/services/patients.service';
import { StaffService } from '../../core/services/staff.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import {
  IpdAdmission, IpdStats, Ward, Bed, WardOccupancy,
  AdmissionStatus, CreateAdmissionDto,
} from '../../core/models/ipd.models';
import { Patient } from '../../core/models/patient.models';
import { forkJoin, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwSelectComponent } from '../../shared/ui/forms/select/select.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwDateInputComponent } from '../../shared/ui/forms/date-input/date-input.component';
import { GwTimeInputComponent } from '../../shared/ui/forms/time-input/time-input.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';

type TabMode = 'admissions' | 'beds' | 'wards';

@Component({
  selector: 'app-ipd',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IconsModule, RouterLink, GwButtonComponent,
    GwFormFieldComponent, GwInputComponent, GwSelectComponent, GwTextareaComponent,
    GwDateInputComponent, GwTimeInputComponent, GwDialogComponent,
  ],
  templateUrl: './ipd.component.html',
  styleUrl: './ipd.component.scss',
})
export class IpdComponent implements OnInit {
  private ipdSvc     = inject(IpdService);
  private patientsSvc = inject(PatientsService);
  private staffSvc   = inject(StaffService);
  private toast      = inject(ToastService);
  readonly auth      = inject(AuthService);
  private appMeta    = inject(AppMetaService);
  private fb         = inject(FormBuilder);

  readonly canCreate = computed(() => this.appMeta.canDo('ipd', 'canCreate'));
  readonly canEdit   = computed(() => this.appMeta.canDo('ipd', 'canEdit'));

  readonly tab          = signal<TabMode>('admissions');
  readonly loading      = signal(true);
  readonly stats        = signal<IpdStats | null>(null);
  readonly admissions   = signal<IpdAdmission[]>([]);
  readonly wards        = signal<Ward[]>([]);
  readonly beds         = signal<Bed[]>([]);
  readonly occupancy    = signal<WardOccupancy[]>([]);
  readonly filterStatus = signal<AdmissionStatus | ''>('admitted');
  readonly total        = signal(0);
  readonly page         = signal(1);
  readonly pageSize     = signal(20);

  readonly admitModal   = signal(false);
  readonly saving       = signal(false);
  readonly availableBeds = signal<Bed[]>([]);
  readonly patients     = signal<Patient[]>([]);
  readonly doctors      = signal<any[]>([]);
  readonly patientSearch$ = new Subject<string>();
  readonly patientQuery  = signal('');
  readonly selectedPatient = signal<Patient | null>(null);

  readonly admitForm = this.fb.nonNullable.group({
    patientId:         ['', Validators.required],
    bedId:             ['', Validators.required],
    admittingDoctorId: ['', Validators.required],
    admissionDate:     [this.todayStr(), Validators.required],
    admissionTime:     [this.nowTime(), Validators.required],
    admissionType:     ['elective'],
    admissionDiagnosis: ['', Validators.required],
    attendantName:     [''],
    attendantPhone:    [''],
    attendantRelation: [''],
    notes:             [''],
  });

  readonly admissionTypes = this.appMeta.admissionTypes;

  readonly bedOptions = computed(() => this.availableBeds().map(b => ({
    value: b.id,
    label: `${b.ward?.name ?? ''} — Bed ${b.bedNumber} (${(b.bedType ?? '').toString()})`,
  })));
  readonly doctorOptions = computed(() => this.doctors().map(d => ({
    value: d.id,
    label: `Dr. ${d.firstName} ${d.lastName}`,
  })));

  readonly filterOptions: { value: string; label: string }[] = [
    { value: '',            label: 'All' },
    { value: 'admitted',    label: 'Admitted' },
    { value: 'discharged',  label: 'Discharged' },
    { value: 'transferred', label: 'Transferred' },
  ];

  get totalPages() { return Math.ceil(this.total() / this.pageSize()); }

  ngOnInit() {
    this.load();
    this.patientSearch$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length >= 2) {
        this.patientsSvc.list({ search: q, limit: 10 }).subscribe({
          next: r => this.patients.set(r.data),
          error: () => {},
        });
      } else {
        this.patients.set([]);
      }
    });
  }

  load() {
    this.loading.set(true);
    forkJoin({
      stats:     this.ipdSvc.getStats(),
      admissions: this.ipdSvc.getAdmissions({
        status: this.filterStatus() || undefined,
        page: this.page(),
        limit: this.pageSize(),
      }),
      occupancy: this.ipdSvc.getWardOccupancy(),
    }).subscribe({
      next: ({ stats, admissions, occupancy }) => {
        this.stats.set((stats as any).data);
        const aData = (admissions as any).data ?? [];
        this.admissions.set(aData);
        this.total.set((admissions as any).meta?.total ?? aData.length);
        this.occupancy.set((occupancy as any).data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadBeds() {
    this.ipdSvc.getBeds().subscribe(r => this.beds.set((r as any).data ?? []));
  }

  openAdmitModal() {
    this.admitForm.reset({ admissionDate: this.todayStr(), admissionTime: this.nowTime(), admissionType: 'elective' });
    this.selectedPatient.set(null);
    this.patients.set([]);
    this.patientQuery.set('');
    forkJoin({
      beds:    this.ipdSvc.getAvailableBeds(),
      doctors: this.staffSvc.getDoctors(),
    }).subscribe({
      next: ({ beds, doctors }) => {
        this.availableBeds.set((beds as any).data ?? []);
        const d = (doctors as any).data?.data ?? (doctors as any).data ?? [];
        this.doctors.set(Array.isArray(d) ? d : []);
      },
    });
    this.admitModal.set(true);
  }

  onPatientSearch(q: string) {
    this.patientQuery.set(q);
    this.patientSearch$.next(q);
  }

  selectPatient(p: Patient) {
    this.selectedPatient.set(p);
    this.admitForm.patchValue({ patientId: p.id });
    this.patients.set([]);
    this.patientQuery.set(`${p.firstName} ${p.lastName}`);
  }

  admit() {
    if (this.admitForm.invalid || this.saving()) return;
    this.saving.set(true);
    const v = this.admitForm.getRawValue();
    const dto: CreateAdmissionDto = {
      patientId:          v.patientId,
      bedId:              v.bedId,
      admittingDoctorId:  v.admittingDoctorId,
      admissionDate:      v.admissionDate,
      admissionTime:      v.admissionTime,
      admissionType:      v.admissionType as any,
      admissionDiagnosis: v.admissionDiagnosis,
      attendantName:      v.attendantName || undefined,
      attendantPhone:     v.attendantPhone || undefined,
      attendantRelation:  v.attendantRelation || undefined,
      notes:              v.notes || undefined,
    };
    this.ipdSvc.admit(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.admitModal.set(false);
        this.toast.success('Patient admitted successfully');
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to admit patient');
      },
    });
  }

  setFilter(s: string) {
    this.filterStatus.set(s as AdmissionStatus | '');
    this.page.set(1);
    this.load();
  }

  switchTab(t: TabMode) {
    this.tab.set(t);
    if (t === 'beds') this.loadBeds();
  }

  bedStatusClass(s: string) {
    const m: Record<string, string> = {
      available: 'badge--success', occupied: 'badge--danger',
      maintenance: 'badge--warning', reserved: 'badge--neutral',
    };
    return m[s] ?? 'badge--neutral';
  }

  admissionStatusClass(s: string) {
    const m: Record<string, string> = {
      admitted: 'badge--primary', discharged: 'badge--success',
      transferred: 'badge--warning', deceased: 'badge--danger', absconded: 'badge--danger',
    };
    return m[s] ?? 'badge--neutral';
  }

  admissionRowClass(s: string) {
    const m: Record<string, string> = {
      admitted:    'row--admitted',
      discharged:  'row--discharged',
      transferred: 'row--transferred',
    };
    return m[s] ?? '';
  }

  los(a: IpdAdmission): number {
    const end = a.dischargeDate ? new Date(a.dischargeDate) : new Date();
    const start = new Date(a.admissionDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  formatCurrency(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
  }
}
