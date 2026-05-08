import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { InsuranceService, InsuranceClaim, InsuranceProvider } from '../../core/services/insurance.service';
import { PatientsService } from '../../core/services/patients.service';
import { Patient } from '../../core/models/patient.models';
import { ToastService } from '../../core/services/toast.service';

type InsuranceTab = 'claims' | 'providers';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [ReactiveFormsModule, IconsModule, DecimalPipe, DatePipe],
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.scss',
})
export class InsuranceComponent implements OnInit {
  private insuranceService = inject(InsuranceService);
  private patientsService = inject(PatientsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly claims = signal<InsuranceClaim[]>([]);
  readonly providers = signal<InsuranceProvider[]>([]);
  readonly stats = signal<any>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly activeTab = signal<InsuranceTab>('claims');
  readonly showClaimModal = signal(false);
  readonly showProviderModal = signal(false);

  // Patient search
  readonly patientQuery = signal('');
  readonly patientDropdown = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  private patientSearchTimer: any;

  claimForm: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    memberName: ['', Validators.required],
    providerId: ['', Validators.required],
    policyNumber: ['', Validators.required],
    claimAmount: [0, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  providerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    contactEmail: [''],
    contactPhone: [''],
    address: [''],
  });

  ngOnInit() {
    this.loadClaims();
    this.loadProviders();
    this.loadStats();
  }

  loadClaims() {
    this.loading.set(true);
    this.insuranceService.getClaims().subscribe({
      next: (res) => { this.claims.set(res.data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.show('Failed to load claims', 'danger'); },
    });
  }

  loadProviders() {
    this.insuranceService.getProviders().subscribe({
      next: (res) => this.providers.set(res.data ?? []),
      error: () => this.toast.show('Failed to load providers', 'danger'),
    });
  }

  loadStats() {
    this.insuranceService.getClaimStats().subscribe({
      next: (res) => this.stats.set(res.data),
      error: () => {},
    });
  }

  openClaimModal() {
    this.claimForm.reset({ patientId: '', memberName: '', providerId: '', policyNumber: '', claimAmount: 0, notes: '' });
    this.patientQuery.set('');
    this.patientDropdown.set([]);
    this.selectedPatient.set(null);
    this.showClaimModal.set(true);
  }

  onPatientSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.patientQuery.set(q);
    clearTimeout(this.patientSearchTimer);
    if (q.length < 2) { this.patientDropdown.set([]); return; }
    this.patientSearchTimer = setTimeout(() => {
      this.patientsService.list({ search: q, limit: 8 }).subscribe({
        next: (res) => this.patientDropdown.set(res.data ?? []),
        error: () => {},
      });
    }, 300);
  }

  selectPatient(patient: Patient) {
    this.selectedPatient.set(patient);
    this.claimForm.patchValue({
      patientId: patient.id,
      memberName: `${patient.firstName} ${patient.lastName}`,
    });
    this.patientQuery.set('');
    this.patientDropdown.set([]);
  }

  clearPatient() {
    this.selectedPatient.set(null);
    this.claimForm.patchValue({ patientId: '', memberName: '' });
    this.patientDropdown.set([]);
  }

  submitClaim() {
    if (this.claimForm.invalid) return;
    this.saving.set(true);
    this.insuranceService.createClaim(this.claimForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.showClaimModal.set(false);
        this.toast.show('Claim created', 'success');
        this.loadClaims();
        this.loadStats();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to create claim', 'danger'); },
    });
  }

  submitProvider() {
    if (this.providerForm.invalid) return;
    this.saving.set(true);
    this.insuranceService.createProvider(this.providerForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.showProviderModal.set(false);
        this.toast.show('Provider added', 'success');
        this.loadProviders();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to add provider', 'danger'); },
    });
  }

  updateClaimStatus(id: string, status: InsuranceClaim['status']) {
    this.insuranceService.updateClaim(id, { status }).subscribe({
      next: () => { this.toast.show('Claim status updated', 'success'); this.loadClaims(); this.loadStats(); },
      error: () => this.toast.show('Failed to update claim', 'danger'),
    });
  }

  openProviderModal() {
    this.providerForm.reset({ name: '', code: '', contactEmail: '', contactPhone: '', address: '' });
    this.showProviderModal.set(true);
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      draft: 'badge--neutral', submitted: 'badge--primary', under_review: 'badge--warning',
      approved: 'badge--success', rejected: 'badge--danger', paid: 'badge--teal',
    };
    return map[status] ?? 'badge--neutral';
  }

  statusLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
