import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { PatientsService } from '../../core/services/patients.service';
import { PrescriptionsService } from '../../core/services/prescriptions.service';
import { Patient, CreatePatientDto, Gender } from '../../core/models/patient.models';
import { Prescription } from '../../core/models/prescription.models';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
})
export class PatientsComponent implements OnInit {
  private patientsSvc = inject(PatientsService);
  private rxSvc       = inject(PrescriptionsService);
  private toast       = inject(ToastService);
  readonly auth       = inject(AuthService);
  private fb          = inject(FormBuilder);

  readonly patients    = signal<Patient[]>([]);
  readonly total       = signal(0);
  readonly loading     = signal(true);
  readonly showModal   = signal(false);
  readonly saving      = signal(false);
  readonly searchQuery = signal('');
  readonly page        = signal(1);
  readonly pageSize    = signal(20);
  readonly sortCol     = signal<string>('createdAt');
  readonly sortDir     = signal<'asc' | 'desc'>('desc');

  readonly sorted = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir();
    return [...this.patients()].sort((a, b) => {
      const av = (a as any)[col] ?? '';
      const bv = (b as any)[col] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  // Patient detail drawer
  readonly selectedPatient    = signal<Patient | null>(null);
  readonly patientPrescriptions = signal<Prescription[]>([]);
  readonly rxLoading            = signal(false);

  // Prescription detail modal
  readonly selectedRx = signal<Prescription | null>(null);

  private search$ = new Subject<string>();

  readonly form = this.fb.nonNullable.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    phone:       ['', Validators.required],
    email:       [''],
    gender:      ['male' as Gender],
    dateOfBirth: [''],
    bloodGroup:  [''],
    addressLine1:[''],
    city:        [''],
    state:       [''],
    notes:       [''],
  });

  ngOnInit() {
    this.loadPatients();
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      this.searchQuery.set(q);
      this.page.set(1);
      this.loadPatients();
    });
  }

  loadPatients() {
    this.loading.set(true);
    this.patientsSvc.list({ search: this.searchQuery(), page: this.page(), limit: this.pageSize() }).subscribe({
      next: r => {
        this.patients.set(r.data);
        this.total.set(r.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event) {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  openDetail(patient: Patient) {
    this.selectedPatient.set(patient);
    this.rxLoading.set(true);
    this.patientPrescriptions.set([]);
    this.rxSvc.list({ patientId: patient.id, limit: 50 }).subscribe({
      next: r => { this.patientPrescriptions.set(r.data); this.rxLoading.set(false); },
      error: () => this.rxLoading.set(false),
    });
  }

  closeDetail() { this.selectedPatient.set(null); this.selectedRx.set(null); }

  openRxDetail(rx: Prescription) { this.selectedRx.set(rx); }
  closeRxDetail() { this.selectedRx.set(null); }

  openCreate() { this.form.reset({ gender: 'male' }); this.showModal.set(true); }
  closeModal()  { this.showModal.set(false); }

  savePatient() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    // Strip empty strings so whitelist validation doesn't reject blank optional fields
    const raw = this.form.getRawValue();
    const body = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    ) as unknown as CreatePatientDto;
    this.patientsSvc.create(body).subscribe({
      next: r => {
        this.patients.update(ps => [r.data, ...ps]);
        this.total.update(t => t + 1);
        this.saving.set(false);
        this.showModal.set(false);
        this.toast.success('Patient registered successfully');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save patient');
      },
    });
  }

  deletePatient(id: string) {
    if (!confirm('Delete this patient? This action cannot be undone.')) return;
    this.patientsSvc.delete(id).subscribe({
      next: () => {
        this.patients.update(ps => ps.filter(p => p.id !== id));
        this.total.update(t => t - 1);
        this.toast.success('Patient deleted');
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to delete'),
    });
  }

  canDelete() { return this.auth.isAdmin(); }

  calcAge(dob: string | undefined): string {
    if (!dob) return '—';
    const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000));
    return `${years} yrs`;
  }

  get totalPages() { return Math.ceil(this.total() / this.pageSize()); }

  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.loadPatients(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.loadPatients(); } }
  changePageSize(n: number) { this.pageSize.set(n); this.page.set(1); this.loadPatients(); }

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
