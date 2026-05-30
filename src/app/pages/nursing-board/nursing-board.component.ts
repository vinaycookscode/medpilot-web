import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AppMetaService } from '../../core/services/app-meta.service';
import { ToastService } from '../../core/services/toast.service';
import {
  EncountersService, NursingBoard, NurseBoardEntry, UnassignedEntry,
  STAGE_LABELS, EncounterStage, EncounterUrgency,
} from '../../core/services/encounters.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../shared/ui/display/badge/badge.component';
import { GwStatCardComponent } from '../../shared/ui/data/stat-card/stat-card.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwSelectComponent, GwSelectOption } from '../../shared/ui/forms/select/select.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';
import { GwEmptyStateComponent } from '../../shared/ui/display/empty-state/empty-state.component';

@Component({
  selector: 'app-nursing-board',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, RouterLink, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwStatCardComponent, GwDialogComponent,
    GwFormFieldComponent, GwSelectComponent, GwTextareaComponent, GwSpinnerComponent,
    GwEmptyStateComponent,
  ],
  templateUrl: './nursing-board.component.html',
  styleUrl: './nursing-board.component.scss',
})
export class NursingBoardComponent implements OnInit {
  private svc = inject(EncountersService);
  private appMeta = inject(AppMetaService);
  private toast = inject(ToastService);

  readonly board = signal<NursingBoard | null>(null);
  readonly loading = signal(true);
  readonly stageLabels = STAGE_LABELS;

  // assign / reassign modal
  readonly modalOpen = signal(false);
  readonly busy = signal(false);
  readonly mode = signal<'assign' | 'reassign'>('assign');
  readonly targetEncounterId = signal<string>('');
  readonly targetLabel = signal<string>('');
  form = { nurseId: '', handoverNotes: '' };

  readonly nurseOptions = computed<GwSelectOption[]>(() =>
    (this.board()?.nurses ?? [])
      .filter(n => n.isActive)
      .map(n => ({ value: n.id, label: `${n.firstName} ${n.lastName} · ${n.patientCount} patient${n.patientCount === 1 ? '' : 's'}` })));

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.nursingBoard().subscribe({
      next: (r) => { this.board.set(r.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load nursing board'); },
    });
  }

  openAssign(u: UnassignedEntry) {
    this.mode.set('assign');
    this.targetEncounterId.set(u.encounterId);
    this.targetLabel.set(`${u.patientName} · ${u.encounterNumber}`);
    this.form = { nurseId: '', handoverNotes: '' };
    this.modalOpen.set(true);
  }

  openReassign(nurse: NurseBoardEntry, p: NurseBoardEntry['patients'][number]) {
    this.mode.set('reassign');
    this.targetEncounterId.set(p.encounterId);
    this.targetLabel.set(`${p.patientName} · ${p.encounterNumber} (from ${nurse.firstName})`);
    this.form = { nurseId: '', handoverNotes: '' };
    this.modalOpen.set(true);
  }

  submit() {
    if (this.busy()) return;
    if (!this.form.nurseId) { this.toast.error('Select a nurse'); return; }
    this.busy.set(true);
    const id = this.targetEncounterId();
    const payload = { nurseId: this.form.nurseId, handoverNotes: this.form.handoverNotes || undefined };
    const req$ = this.mode() === 'assign' ? this.svc.assignNurse(id, payload) : this.svc.reassignNurse(id, payload);
    req$.subscribe({
      next: () => {
        this.busy.set(false);
        this.modalOpen.set(false);
        this.toast.success(this.mode() === 'assign' ? 'Nurse assigned' : 'Patient reassigned');
        this.load();
      },
      error: (err) => { this.busy.set(false); this.toast.error(err?.error?.message ?? 'Failed'); },
    });
  }

  availabilityVariant(n: NurseBoardEntry): GwBadgeVariant {
    if (!n.isActive) return 'neutral';
    if (n.patientCount === 0) return 'success';
    if (n.patientCount <= 2) return 'info';
    return 'warning';
  }

  availabilityLabel(n: NurseBoardEntry): string {
    if (!n.isActive) return 'Inactive';
    if (n.patientCount === 0) return 'Available';
    return `${n.patientCount} patient${n.patientCount === 1 ? '' : 's'}`;
  }

  stageVariant(stage: EncounterStage): GwBadgeVariant {
    return stage === 'in_care' ? 'success' : 'primary';
  }

  urgencyVariant(u: EncounterUrgency): GwBadgeVariant {
    return u === 'emergency' ? 'danger' : u === 'urgent' ? 'warning' : 'neutral';
  }
}
