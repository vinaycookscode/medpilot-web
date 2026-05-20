import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { PatientsService } from '../../core/services/patients.service';
import { PrescriptionsService } from '../../core/services/prescriptions.service';
import { AbhaService, AbhaProfile, EnrollAbhaResult, VerifyAbhaResult, CareContext } from '../../core/services/abha.service';
import { Patient, CreatePatientDto, Gender } from '../../core/models/patient.models';
import { Prescription } from '../../core/models/prescription.models';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { debounceTime, distinctUntilChanged, interval, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
})
export class PatientsComponent implements OnInit, OnDestroy {
  private patientsSvc = inject(PatientsService);
  private rxSvc       = inject(PrescriptionsService);
  private abhaSvc     = inject(AbhaService);
  private toast       = inject(ToastService);
  readonly auth       = inject(AuthService);
  private fb          = inject(FormBuilder);
  private countdownSub?: Subscription;

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

  // ABHA
  readonly abhaProfile      = signal<AbhaProfile | null>(null);
  readonly abhaLoading      = signal(false);
  readonly showAbhaInfo     = signal(false);

  // Create ABHA modal
  readonly showCreateAbha      = signal(false);
  readonly abhaCreateStep      = signal<1 | 2 | 3 | 4>(1);
  readonly abhaCreateLoading   = signal(false);
  readonly abhaCreateSuggestions = signal<string[]>([]);
  readonly abhaCreateResult    = signal<EnrollAbhaResult | null>(null);
  readonly abhaCountdown       = signal(60);
  abhaAadhaar = '';
  abhaMobile  = '';
  abhaOtp     = '';
  abhaCreateSessionToken = '';
  selectedAbhaAddress    = '';

  // Verify/Link ABHA modal
  readonly showVerifyAbha    = signal(false);
  readonly abhaVerifyStep    = signal<1 | 2 | 3>(1);
  readonly abhaVerifyLoading = signal(false);
  readonly abhaVerifyResult  = signal<VerifyAbhaResult | null>(null);
  readonly abhaVerifyCountdown = signal(60);
  abhaVerifyLoginId      = '';
  abhaVerifyOtp          = '';
  abhaVerifySessionToken = '';

  // Care Contexts
  readonly careContexts        = signal<CareContext[]>([]);
  readonly careContextsLoading = signal(false);

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
    this.patientPrescriptions.set([]);
    this.abhaProfile.set(null);
    this.careContexts.set([]);
    this.rxLoading.set(true);
    this.rxSvc.list({ patientId: patient.id, limit: 50 }).subscribe({
      next: r => { this.patientPrescriptions.set(r.data); this.rxLoading.set(false); },
      error: () => this.rxLoading.set(false),
    });
    this.abhaLoading.set(true);
    this.abhaSvc.getProfile(patient.id).subscribe({
      next: r => { this.abhaProfile.set(r.data); this.abhaLoading.set(false); },
      error: () => this.abhaLoading.set(false),
    });
    this.loadCareContexts(patient.id);
  }

  closeDetail() {
    this.countdownSub?.unsubscribe();
    this.showCreateAbha.set(false);
    this.showVerifyAbha.set(false);
    this.selectedPatient.set(null);
    this.selectedRx.set(null);
  }

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

  ngOnDestroy() { this.countdownSub?.unsubscribe(); }

  // ── ABHA Create ─────────────────────────────────────────────────────────────

  openCreateAbha() {
    this.abhaAadhaar = '';
    this.abhaMobile  = '';
    this.abhaOtp     = '';
    this.abhaCreateSessionToken = '';
    this.selectedAbhaAddress    = '';
    this.abhaCreateSuggestions.set([]);
    this.abhaCreateResult.set(null);
    this.abhaCreateStep.set(1);
    this.showCreateAbha.set(true);
  }

  closeCreateAbha() {
    this.countdownSub?.unsubscribe();
    this.showCreateAbha.set(false);
  }

  initiateAbhaCreate() {
    const patientId = this.selectedPatient()!.id;
    this.abhaCreateLoading.set(true);
    this.abhaSvc.initiateCreate(patientId, this.abhaAadhaar).subscribe({
      next: r => {
        this.abhaCreateSessionToken = r.data.sessionToken;
        this.abhaOtp = '';
        this.abhaCreateLoading.set(false);
        this.abhaCreateStep.set(2);
        this.startCountdown('create');
      },
      error: err => {
        this.abhaCreateLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to send OTP');
      },
    });
  }

  enrollAbha() {
    this.abhaCreateLoading.set(true);
    this.abhaSvc.enrollAbha(
      this.abhaCreateSessionToken, this.abhaOtp, this.abhaMobile || undefined,
    ).subscribe({
      next: r => {
        this.countdownSub?.unsubscribe();
        this.abhaCreateResult.set(r.data);
        this.abhaCreateLoading.set(false);
        if (r.data.suggestions?.length && !r.data.abhaAddress) {
          this.abhaCreateSuggestions.set(r.data.suggestions);
          this.abhaCreateSessionToken = r.data.sessionToken;
          this.selectedAbhaAddress = r.data.suggestions[0];
          this.abhaCreateStep.set(3);
        } else {
          this.abhaCreateStep.set(4);
          this.refreshAbhaProfile();
        }
      },
      error: err => {
        this.abhaCreateLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Enrollment failed');
      },
    });
  }

  selectAbhaAddress() {
    this.abhaCreateLoading.set(true);
    this.abhaSvc.selectAddress(this.abhaCreateSessionToken, this.selectedAbhaAddress).subscribe({
      next: r => {
        this.abhaCreateResult.update(res =>
          res ? { ...res, abhaAddress: r.data.abhaAddress } : res,
        );
        this.abhaCreateLoading.set(false);
        this.abhaCreateStep.set(4);
        this.refreshAbhaProfile();
      },
      error: err => {
        this.abhaCreateLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to set ABHA address');
      },
    });
  }

  skipAddressSelection() {
    this.abhaCreateStep.set(4);
    this.refreshAbhaProfile();
  }

  // ── ABHA Verify / Link ───────────────────────────────────────────────────

  openVerifyAbha() {
    this.abhaVerifyLoginId = '';
    this.abhaVerifyOtp     = '';
    this.abhaVerifySessionToken = '';
    this.abhaVerifyResult.set(null);
    this.abhaVerifyStep.set(1);
    this.showVerifyAbha.set(true);
  }

  closeVerifyAbha() {
    this.countdownSub?.unsubscribe();
    this.showVerifyAbha.set(false);
  }

  initiateAbhaVerify() {
    const patientId = this.selectedPatient()!.id;
    this.abhaVerifyLoading.set(true);
    this.abhaSvc.initiateVerifyForPatient(patientId, this.abhaVerifyLoginId).subscribe({
      next: r => {
        this.abhaVerifySessionToken = r.data.sessionToken;
        this.abhaVerifyOtp = '';
        this.abhaVerifyLoading.set(false);
        this.abhaVerifyStep.set(2);
        this.startCountdown('verify');
      },
      error: err => {
        this.abhaVerifyLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to send OTP');
      },
    });
  }

  confirmAbhaVerify() {
    this.abhaVerifyLoading.set(true);
    this.abhaSvc.confirmVerify(this.abhaVerifySessionToken, this.abhaVerifyOtp).subscribe({
      next: r => {
        this.countdownSub?.unsubscribe();
        this.abhaVerifyResult.set(r.data);
        this.abhaVerifyLoading.set(false);
        this.abhaVerifyStep.set(3);
        this.refreshAbhaProfile();
      },
      error: err => {
        this.abhaVerifyLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Verification failed');
      },
    });
  }

  // ── ABHA Card & Unlink ───────────────────────────────────────────────────

  downloadCard() {
    const patientId = this.selectedPatient()!.id;
    this.abhaLoading.set(true);
    this.abhaSvc.downloadCard(patientId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abha-card-${patientId}.png`;
        a.click();
        URL.revokeObjectURL(url);
        this.abhaLoading.set(false);
      },
      error: err => {
        this.abhaLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to download ABHA card');
      },
    });
  }

  unlinkAbha() {
    if (!confirm('Unlink ABHA from this patient? The ABHA number will be removed from their record.')) return;
    const patientId = this.selectedPatient()!.id;
    this.abhaLoading.set(true);
    this.abhaSvc.unlink(patientId).subscribe({
      next: () => {
        this.abhaProfile.set({
          hasAbha: false, abhaNumber: null, abhaAddress: null,
          verified: false, kycType: null, linkedAt: null,
        });
        this.abhaLoading.set(false);
        this.toast.success('ABHA unlinked');
      },
      error: err => {
        this.abhaLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to unlink ABHA');
      },
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private refreshAbhaProfile() {
    const patientId = this.selectedPatient()?.id;
    if (!patientId) return;
    this.abhaSvc.getProfile(patientId).subscribe({
      next: r => this.abhaProfile.set(r.data),
    });
  }

  loadCareContexts(patientId?: string) {
    const id = patientId ?? this.selectedPatient()?.id;
    if (!id) return;
    this.careContextsLoading.set(true);
    this.abhaSvc.getCareContexts(id).subscribe({
      next: r => { this.careContexts.set(r.data ?? []); this.careContextsLoading.set(false); },
      error: () => this.careContextsLoading.set(false),
    });
  }

  ccSourceLabel(sourceType: string): string {
    const map: Record<string, string> = {
      appointment: 'Consultation',
      prescription: 'Prescription',
      lab_order: 'Lab Report',
    };
    return map[sourceType] ?? sourceType;
  }

  ccSourceIcon(sourceType: string): string {
    const map: Record<string, string> = {
      appointment: 'stethoscope',
      prescription: 'file-text',
      lab_order: 'flask-conical',
    };
    return map[sourceType] ?? 'file';
  }

  private startCountdown(type: 'create' | 'verify') {
    this.countdownSub?.unsubscribe();
    if (type === 'create') this.abhaCountdown.set(60);
    else this.abhaVerifyCountdown.set(60);
    this.countdownSub = interval(1000).subscribe(() => {
      if (type === 'create') {
        const v = this.abhaCountdown();
        if (v > 0) this.abhaCountdown.set(v - 1);
        else this.countdownSub?.unsubscribe();
      } else {
        const v = this.abhaVerifyCountdown();
        if (v > 0) this.abhaVerifyCountdown.set(v - 1);
        else this.countdownSub?.unsubscribe();
      }
    });
  }
}
