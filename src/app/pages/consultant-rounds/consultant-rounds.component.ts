import { Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import {
  ConsultantService, ConsultantAdmission, ConsultantRound,
} from '../../core/services/consultant.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-consultant-rounds',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DatePipe],
  templateUrl: './consultant-rounds.component.html',
  styleUrl: './consultant-rounds.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ConsultantRoundsComponent implements OnInit {
  private svc   = inject(ConsultantService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly admissions = signal<ConsultantAdmission[]>([]);
  readonly loading    = signal(false);
  readonly showAll    = signal(false);

  readonly selectedId = signal<string | null>(null);
  readonly rounds     = signal<ConsultantRound[]>([]);
  readonly roundsLoading = signal(false);

  // New round form
  readonly noteDraft  = signal<string>('');
  readonly instrDraft = signal<string>('');
  readonly saving     = signal(false);

  readonly canShowAll = computed(() => {
    const r = this.auth.user()?.role;
    return r === 'admin' || r === 'super_admin';
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? this.admissions().find(a => a.id === id) ?? null : null;
  });

  ngOnInit() {
    this.loadAdmissions();
  }

  private loadAdmissions() {
    this.loading.set(true);
    this.svc.myAdmissions(this.showAll()).subscribe({
      next: list => {
        this.admissions.set(list);
        this.loading.set(false);
        // Auto-select first patient if none chosen
        if (!this.selectedId() && list.length > 0) this.pick(list[0].id);
      },
      error: () => { this.admissions.set([]); this.loading.set(false); },
    });
  }

  toggleShowAll() {
    this.showAll.update(v => !v);
    this.loadAdmissions();
  }

  pick(admissionId: string) {
    this.selectedId.set(admissionId);
    this.roundsLoading.set(true);
    this.svc.listForAdmission(admissionId).subscribe({
      next: r => { this.rounds.set(r); this.roundsLoading.set(false); },
      error: () => { this.rounds.set([]); this.roundsLoading.set(false); },
    });
  }

  submitRound() {
    const id = this.selectedId();
    if (!id || !this.noteDraft().trim() || this.saving()) return;
    this.saving.set(true);
    this.svc.createRound({
      admissionId: id,
      roundNotes: this.noteDraft().trim(),
      instructionsForRmo: this.instrDraft().trim() || undefined,
    }).subscribe({
      next: () => {
        this.toast.success(this.instrDraft().trim() ? 'Round logged · RMO instruction created' : 'Round logged');
        this.noteDraft.set('');
        this.instrDraft.set('');
        this.saving.set(false);
        this.pick(id);
        // Refresh openInstructions count on the patient list
        this.svc.myAdmissions(this.showAll()).subscribe({
          next: list => this.admissions.set(list),
        });
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save round');
      },
    });
  }

  cancelInstruction(round: ConsultantRound) {
    if (round.instructionStatus !== 'open') return;
    this.svc.cancelInstruction(round.id).subscribe({
      next: () => {
        this.toast.success('Instruction cancelled');
        const id = this.selectedId();
        if (id) this.pick(id);
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to cancel'),
    });
  }

  initials(p: { firstName?: string; lastName?: string } | null | undefined): string {
    if (!p) return '';
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
  }

  patientHue(id: string | undefined | null): number {
    if (!id) return 220;
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return h % 360;
  }
}
