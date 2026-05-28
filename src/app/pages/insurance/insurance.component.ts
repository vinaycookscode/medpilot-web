import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { InsuranceService, InsuranceClaim, InsuranceProvider } from '../../core/services/insurance.service';
import { PatientsService } from '../../core/services/patients.service';
import { Patient } from '../../core/models/patient.models';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwSelectComponent } from '../../shared/ui/forms/select/select.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwIconButtonComponent } from '../../shared/ui/buttons/icon-button/icon-button.component';
import { GwBadgeComponent } from '../../shared/ui/display/badge/badge.component';
import { GwEmptyStateComponent } from '../../shared/ui/display/empty-state/empty-state.component';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';
import { GwCardComponent } from '../../shared/ui/display/card/card.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';
import { GwTabsComponent } from '../../shared/ui/navigation/tabs/tabs.component';
import { GwTabComponent } from '../../shared/ui/navigation/tabs/tab.component';
import { GwPaginationComponent } from '../../shared/ui/navigation/pagination/pagination.component';

type InsuranceTab = 'claims' | 'providers';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, IconsModule, DecimalPipe, DatePipe,
    GwFormFieldComponent, GwInputComponent, GwSelectComponent, GwTextareaComponent,
    GwButtonComponent, GwIconButtonComponent,
    GwBadgeComponent, GwEmptyStateComponent, GwSpinnerComponent, GwCardComponent,
    GwDialogComponent,
    GwTabsComponent, GwTabComponent, GwPaginationComponent,
  ],
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.scss',
})
export class InsuranceComponent implements OnInit {
  private insuranceService = inject(InsuranceService);
  private patientsService = inject(PatientsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly claims = signal<InsuranceClaim[]>([]);
  readonly providers = signal<InsuranceProvider[]>([]);
  readonly stats = signal<any>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly activeTab = signal<InsuranceTab>('claims');
  readonly showClaimModal = signal(false);
  readonly showProviderModal = signal(false);

  // Claims server-side pagination + sort
  readonly claimsTotal    = signal(0);
  readonly claimsPage     = signal(1);
  readonly claimsPageSize = signal(20);
  readonly claimsSortCol  = signal<string>('createdAt');
  readonly claimsSortDir  = signal<'ASC' | 'DESC'>('DESC');

  // Server-sortable columns — others sort client-side on current page
  private readonly serverSortCols = new Set(['createdAt', 'claimAmount', 'approvedAmount', 'status', 'policyNumber']);

  readonly providerOptions = computed(() =>
    this.providers().map(p => ({ value: p.id, label: p.name })),
  );

  setTab(tab: string) { this.activeTab.set(tab as InsuranceTab); }

  readonly sortedClaims = computed(() => {
    const col = this.claimsSortCol();
    const dir = this.claimsSortDir();
    if (this.serverSortCols.has(col)) return this.claims();
    return [...this.claims()].sort((a, b) => {
      const av = (a as any)[col] ?? '';
      const bv = (b as any)[col] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return dir === 'ASC' ? cmp : -cmp;
    });
  });

  get claimsTotalPages() { return Math.ceil(this.claimsTotal() / this.claimsPageSize()); }

  claimsPrevPage() {
    if (this.claimsPage() > 1) { this.claimsPage.update(p => p - 1); this.loadClaims(); }
  }
  claimsNextPage() {
    if (this.claimsPage() < this.claimsTotalPages) { this.claimsPage.update(p => p + 1); this.loadClaims(); }
  }
  changeClaimsPageSize(n: number) { this.claimsPageSize.set(n); this.claimsPage.set(1); this.loadClaims(); }

  // Patient search
  readonly patientQuery = signal('');
  readonly patientDropdown = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  readonly patientSearching = signal(false);
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
    const col = this.claimsSortCol();
    const serverSort = this.serverSortCols.has(col);
    this.insuranceService.getClaims({
      page: this.claimsPage(),
      limit: this.claimsPageSize(),
      ...(serverSort ? { sortBy: col, sortOrder: this.claimsSortDir() } : {}),
    }).subscribe({
      next: (res) => {
        this.claims.set(res.data ?? []);
        this.claimsTotal.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.show('Failed to load claims', 'danger'); },
    });
  }

  loadProviders() {
    this.insuranceService.getProviders().subscribe({
      next: (res: any) => this.providers.set(res.data?.data ?? res.data ?? []),
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
    this.patientSearching.set(false);
    this.selectedPatient.set(null);
    this.showClaimModal.set(true);
  }

  onPatientSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.patientQuery.set(q);
    clearTimeout(this.patientSearchTimer);
    if (q.length < 2) { this.patientDropdown.set([]); this.patientSearching.set(false); return; }
    this.patientSearching.set(true);
    this.patientSearchTimer = setTimeout(() => {
      this.patientsService.list({ search: q, limit: 8 }).subscribe({
        next: (res) => { this.patientDropdown.set(res.data ?? []); this.patientSearching.set(false); },
        error: () => { this.patientSearching.set(false); },
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

  sortClaims(col: string) {
    if (this.claimsSortCol() === col) {
      this.claimsSortDir.update(d => d === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.claimsSortCol.set(col);
      this.claimsSortDir.set('ASC');
    }
    this.claimsPage.set(1);
    if (this.serverSortCols.has(col)) this.loadClaims();
  }

  sortIcon(active: string, col: string, dir: string): string {
    if (active !== col) return 'chevrons-up-down';
    return dir === 'ASC' ? 'chevron-up' : 'chevron-down';
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
