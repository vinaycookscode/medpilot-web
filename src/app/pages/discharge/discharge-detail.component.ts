import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { ToastService } from '../../core/services/toast.service';
import {
  DischargeService, DischargeProcess, DischargeStage, ActivitySheet,
  DISCHARGE_STAGE_LABELS, computeDischargeSteps,
} from '../../core/services/discharge.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../shared/ui/display/badge/badge.component';
import { GwStepperComponent, GwStep } from '../../shared/ui/navigation/stepper/stepper.component';
import { GwTableComponent, GwTableColumn } from '../../shared/ui/data/table/table.component';
import { GwCellDirective } from '../../shared/ui/data/table/cell.directive';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwSelectComponent, GwSelectOption } from '../../shared/ui/forms/select/select.component';
import { GwDateInputComponent } from '../../shared/ui/forms/date-input/date-input.component';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';

type ModalKind = 'card' | 'cancel' | null;

@Component({
  selector: 'app-discharge-detail',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, RouterLink, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwStepperComponent, GwTableComponent, GwCellDirective,
    GwDialogComponent, GwFormFieldComponent, GwInputComponent, GwTextareaComponent,
    GwSelectComponent, GwDateInputComponent, GwSpinnerComponent,
  ],
  templateUrl: './discharge-detail.component.html',
  styleUrl: './discharge-detail.component.scss',
})
export class DischargeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(DischargeService);
  private appMeta = inject(AppMetaService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly proc = signal<DischargeProcess | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly modal = signal<ModalKind>(null);
  readonly sheet = signal<ActivitySheet | null>(null);

  readonly stageLabels = DISCHARGE_STAGE_LABELS;
  readonly steps = computed<GwStep[]>(() => { const p = this.proc(); return p ? computeDischargeSteps(p).steps : []; });
  readonly activeStep = computed(() => { const p = this.proc(); return p ? computeDischargeSteps(p).active : 0; });

  cardForm = {
    finalDiagnosis: '', dischargeType: '', conditionAtDischarge: '',
    clinicalSummary: '', treatmentGiven: '', followUpInstructions: '', followUpDate: '',
  };
  cancelReason = '';

  readonly sheetColumns: GwTableColumn[] = [
    { key: 'category', label: 'Type', width: '120px' },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Qty', width: '60px', align: 'right' },
    { key: 'unitPrice', label: 'Rate', width: '90px', align: 'right' },
    { key: 'amount', label: 'Amount', width: '100px', align: 'right' },
  ];

  readonly dischargeTypeOptions = computed<GwSelectOption[]>(() =>
    this.appMeta.dischargeTypes().map(o => ({ value: o.value, label: o.label })));
  readonly conditionOptions = computed<GwSelectOption[]>(() =>
    this.appMeta.patientConditions().map(o => ({ value: o.value, label: o.label })));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: (r) => {
        this.proc.set(r.data);
        this.loading.set(false);
        if (r.data.stage === 'billing' && this.canBill()) this.loadSheet(id);
      },
      error: () => { this.loading.set(false); this.toast.error('Failed to load discharge'); },
    });
  }
  reload() { const p = this.proc(); if (p) this.load(p.id); }

  loadSheet(id: string) {
    this.svc.getActivitySheet(id).subscribe({ next: (r) => this.sheet.set(r.data) });
  }

  // ─── role gating ──
  private get myRole() { return this.auth.role(); }
  private inRole(...roles: string[]) { const r = this.myRole; return !!r && roles.includes(r); }
  canCard() { return this.inRole('rmo', 'admin', 'super_admin'); }
  canBill() { return this.inRole('billing_staff', 'admin', 'super_admin'); }
  readonly canCancel = computed(() => {
    const p = this.proc();
    if (!p) return false;
    if (p.stage === 'completed' || p.stage === 'cancelled') return false;
    return this.inRole('consultant', 'rmo', 'admin', 'super_admin');
  });

  // ─── actions ──
  openCard() {
    const p = this.proc();
    this.cardForm = {
      finalDiagnosis: p?.finalDiagnosis ?? p?.admission?.['admissionDiagnosis' as never] ?? '',
      dischargeType: '', conditionAtDischarge: '',
      clinicalSummary: '', treatmentGiven: '', followUpInstructions: '', followUpDate: '',
    };
    this.modal.set('card');
  }
  closeModal() { this.modal.set(null); }

  submitCard() {
    const p = this.proc(); if (!p || this.busy()) return;
    if (!this.cardForm.finalDiagnosis.trim()) { this.toast.error('Enter the final diagnosis'); return; }
    if (!this.cardForm.dischargeType) { this.toast.error('Select a discharge type'); return; }
    if (!this.cardForm.conditionAtDischarge) { this.toast.error('Select condition at discharge'); return; }
    if (!this.cardForm.clinicalSummary.trim()) { this.toast.error('Enter the clinical summary'); return; }
    this.busy.set(true);
    this.svc.createCard(p.id, {
      finalDiagnosis: this.cardForm.finalDiagnosis,
      dischargeType: this.cardForm.dischargeType,
      conditionAtDischarge: this.cardForm.conditionAtDischarge,
      clinicalSummary: this.cardForm.clinicalSummary,
      treatmentGiven: this.cardForm.treatmentGiven || undefined,
      followUpInstructions: this.cardForm.followUpInstructions || undefined,
      followUpDate: this.cardForm.followUpDate || undefined,
    }).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Discharge card submitted — sent to billing'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  generateBill() {
    const p = this.proc(); if (!p || this.busy()) return;
    this.busy.set(true);
    this.svc.generateBill(p.id).subscribe({
      next: () => { this.busy.set(false); this.toast.success('Bill generated — patient discharged'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  private openBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  downloadBill() {
    const p = this.proc(); if (!p) return;
    this.svc.getBill(p.id).subscribe({ next: (b) => this.openBlob(b), error: () => this.toast.error('Failed to load bill') });
  }
  downloadClinicalRecord() {
    const p = this.proc(); if (!p) return;
    this.svc.getClinicalRecord(p.id).subscribe({ next: (b) => this.openBlob(b), error: () => this.toast.error('Failed to load clinical record') });
  }

  submitCancel() {
    const p = this.proc(); if (!p || this.busy()) return;
    this.busy.set(true);
    this.svc.cancel(p.id, this.cancelReason || undefined).subscribe({
      next: () => { this.busy.set(false); this.closeModal(); this.toast.success('Discharge cancelled'); this.reload(); },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  // ─── display ──
  back() { this.router.navigate(['/discharge']); }
  stageVariant(stage: DischargeStage): GwBadgeVariant {
    const m: Record<string, GwBadgeVariant> = {
      rmo_card: 'primary', billing: 'warning', completed: 'success', cancelled: 'danger',
    };
    return m[stage] ?? 'neutral';
  }
}
