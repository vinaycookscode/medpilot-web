import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { PatientsService, PatientHistory } from '../../core/services/patients.service';
import { DischargeService } from '../../core/services/discharge.service';
import { ToastService } from '../../core/services/toast.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../shared/ui/display/badge/badge.component';
import { GwStatCardComponent } from '../../shared/ui/data/stat-card/stat-card.component';
import { GwTableComponent, GwTableColumn } from '../../shared/ui/data/table/table.component';
import { GwCellDirective } from '../../shared/ui/data/table/cell.directive';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';
import { GwEmptyStateComponent } from '../../shared/ui/display/empty-state/empty-state.component';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwStatCardComponent, GwTableComponent, GwCellDirective,
    GwSpinnerComponent, GwEmptyStateComponent,
  ],
  templateUrl: './patient-history.component.html',
  styleUrl: './patient-history.component.scss',
})
export class PatientHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(PatientsService);
  private discharge = inject(DischargeService);
  private toast = inject(ToastService);
  private appMeta = inject(AppMetaService);

  readonly history = signal<PatientHistory | null>(null);
  readonly loading = signal(true);
  readonly expanded = signal<Set<string>>(new Set());
  readonly downloading = signal<string | null>(null);

  readonly visitColumns: GwTableColumn[] = [
    { key: 'encounterNumber', label: 'Visit', width: '130px' },
    { key: 'createdAt', label: 'Date', width: '120px' },
    { key: 'chiefComplaint', label: 'Complaint' },
    { key: 'disposition', label: 'Outcome', width: '130px' },
    { key: 'doctor', label: 'Doctor', width: '160px' },
  ];
  readonly invColumns: GwTableColumn[] = [
    { key: 'orderNumber', label: 'Order', width: '140px' },
    { key: 'departmentType', label: 'Type', width: '120px' },
    { key: 'createdAt', label: 'Date', width: '120px' },
    { key: 'status', label: 'Status', width: '110px' },
    { key: 'amount', label: 'Amount', width: '100px', align: 'right' },
    { key: 'report', label: '', width: '90px', align: 'right' },
  ];
  readonly pharmaColumns: GwTableColumn[] = [
    { key: 'orderNumber', label: 'Order', width: '150px' },
    { key: 'createdAt', label: 'Date', width: '120px' },
    { key: 'pharmacyType', label: 'Type', width: '110px' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'totalAmount', label: 'Amount', width: '110px', align: 'right' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.svc.history(id).subscribe({
      next: (r) => { this.history.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  back() { this.router.navigate(['/patients']); }

  toggle(id: string) {
    const s = new Set(this.expanded());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expanded.set(s);
  }
  isExpanded(id: string) { return this.expanded().has(id); }

  age(dob?: string): string {
    if (!dob) return '';
    return `${Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000))}y`;
  }

  statusVariant(s?: string): GwBadgeVariant {
    return s === 'admitted' ? 'success' : s === 'opd_active' ? 'info' : 'neutral';
  }
  statusLabel(s?: string): string {
    return s === 'admitted' ? 'Admitted' : s === 'opd_active' ? 'OPD in progress' : 'No active treatment';
  }
  admissionVariant(s?: string): GwBadgeVariant {
    return s === 'admitted' ? 'success' : s === 'discharged' ? 'neutral' : 'warning';
  }

  fileUrl(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return `${window.location.protocol}//${window.location.hostname}:3000${path}`;
  }

  formatCurrency(n: number | string | undefined | null): string {
    const v = Number(n ?? 0);
    return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  /** Open the discharge bill PDF for a discharged admission in a new tab. */
  downloadBill(admissionId: string) {
    this.openPdf(`bill-${admissionId}`, this.discharge.getBillByAdmission(admissionId), 'bill');
  }
  /** Open the clinical record PDF for a discharged admission in a new tab. */
  downloadRecord(admissionId: string) {
    this.openPdf(`record-${admissionId}`, this.discharge.getClinicalRecordByAdmission(admissionId), 'clinical record');
  }
  private openPdf(key: string, req: ReturnType<DischargeService['getBillByAdmission']>, label: string) {
    if (this.downloading()) return;
    this.downloading.set(key);
    req.subscribe({
      next: (blob) => {
        this.downloading.set(null);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => { this.downloading.set(null); this.toast.error(`Could not open the ${label}`); },
    });
  }
}
