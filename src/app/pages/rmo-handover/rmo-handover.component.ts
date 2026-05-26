import { Component, OnInit, OnDestroy, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import {
  RmoService, RmoActiveAdmission, RmoLite, RmoHandover,
} from '../../core/services/rmo.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

type Tab = 'handover' | 'pending' | 'history';

@Component({
  selector: 'app-rmo-handover',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DatePipe],
  templateUrl: './rmo-handover.component.html',
  styleUrl: './rmo-handover.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RmoHandoverComponent implements OnInit, OnDestroy {
  private svc   = inject(RmoService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  private visibilityHandler: (() => void) | null = null;

  readonly tab = signal<Tab>('handover');

  readonly admissions = signal<RmoActiveAdmission[]>([]);
  readonly rmos       = signal<RmoLite[]>([]);
  readonly loading    = signal(false);
  readonly saving     = signal(false);
  readonly incomingRmoId = signal<string>('');
  readonly selected   = signal<Record<string, string>>({});
  readonly wardFilter = signal<string>('');

  readonly pending          = signal<RmoHandover[]>([]);
  readonly pendingExpanded  = signal<string | null>(null);
  readonly ackNote          = signal<string>('');

  readonly history          = signal<RmoHandover[]>([]);
  readonly historyTotal     = signal(0);
  readonly historyFilter    = signal<'all' | 'pending' | 'acknowledged'>('all');
  readonly historyExpanded  = signal<string | null>(null);

  readonly selectedCount = computed(() => Object.keys(this.selected()).length);
  readonly canSubmit     = computed(() =>
    !!this.incomingRmoId() && this.selectedCount() > 0 && !this.saving()
  );

  readonly wardOptions = computed(() => {
    const set = new Map<string, string>();
    for (const a of this.admissions()) {
      const w = a.bed?.ward;
      if (w) set.set(w.id, w.name);
    }
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  });

  readonly visibleAdmissions = computed(() => {
    const f = this.wardFilter();
    if (!f) return this.admissions();
    return this.admissions().filter(a => a.bed?.ward?.id === f);
  });

  readonly pendingCount = computed(() => this.pending().length);

  readonly historyByPatient = computed(() => {
    const groups = new Map<string, {
      admissionId: string;
      patient: RmoHandover['patient'];
      bed: RmoHandover['bed'];
      handovers: RmoHandover[];
      pendingCount: number;
    }>();
    for (const h of this.history()) {
      if (!h.admissionId) continue;
      if (!groups.has(h.admissionId)) {
        groups.set(h.admissionId, {
          admissionId: h.admissionId,
          patient: h.patient,
          bed: h.bed,
          handovers: [],
          pendingCount: 0,
        });
      }
      const g = groups.get(h.admissionId)!;
      g.handovers.push(h);
      if (!h.acknowledgedAt) g.pendingCount++;
    }
    return Array.from(groups.values())
      .map(g => ({
        ...g,
        handovers: [...g.handovers].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      }))
      .sort((a, b) =>
        new Date(b.handovers[0].createdAt).getTime() -
        new Date(a.handovers[0].createdAt).getTime(),
      );
  });

  ngOnInit() {
    this.loadHandoverTab();
    this.loadPending();
    this.loadHistory();

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.loadPending();
        if (this.tab() === 'history') this.loadHistory();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy() {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  switchTab(t: Tab) {
    this.tab.set(t);
    if (t === 'pending') this.loadPending();
    if (t === 'history') this.loadHistory();
  }

  refreshPending() { this.loadPending(); this.toast.success('Refreshed'); }
  refreshHistory() { this.loadHistory(); this.toast.success('Refreshed'); }

  private loadHandoverTab() {
    this.loading.set(true);
    this.svc.activeAdmissions().subscribe({
      next: list => { this.admissions.set(list); this.loading.set(false); },
      error: () => { this.admissions.set([]); this.loading.set(false); },
    });
    this.svc.rmos().subscribe({
      next: list => this.rmos.set(list.filter(n => n.id !== this.auth.user()?.id)),
      error: () => this.rmos.set([]),
    });
  }

  isSelected(admissionId: string): boolean { return admissionId in this.selected(); }

  toggleSelect(admissionId: string) {
    this.selected.update(s => {
      const next = { ...s };
      if (admissionId in next) delete next[admissionId];
      else next[admissionId] = '';
      return next;
    });
  }

  setNote(admissionId: string, value: string) {
    this.selected.update(s => ({ ...s, [admissionId]: value }));
  }

  selectAllVisible() {
    const next = { ...this.selected() };
    for (const a of this.visibleAdmissions()) {
      if (!(a.id in next)) next[a.id] = '';
    }
    this.selected.set(next);
  }

  clearSelection() { this.selected.set({}); }

  setWardFilter(wardId: string) {
    this.wardFilter.set(this.wardFilter() === wardId ? '' : wardId);
  }

  submitHandover() {
    const incoming = this.incomingRmoId();
    if (!incoming || this.saving()) return;
    const items = Object.entries(this.selected())
      .filter(([_, notes]) => notes.trim().length > 0)
      .map(([admissionId, notes]) => ({ admissionId, handoverNotes: notes.trim() }));
    if (items.length === 0) {
      this.toast.error('Add at least one handover note before submitting.');
      return;
    }
    this.saving.set(true);
    this.svc.createHandover({ incomingRmoId: incoming, items }).subscribe({
      next: res => {
        this.toast.success(`Handed over ${res.count} patient${res.count === 1 ? '' : 's'}`);
        this.saving.set(false);
        this.clearSelection();
        this.incomingRmoId.set('');
        this.loadPending();
        this.loadHistory();
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to record handover');
      },
    });
  }

  private loadPending() {
    this.svc.listPending().subscribe({
      next: r => this.pending.set(r),
      error: () => this.pending.set([]),
    });
  }

  togglePending(id: string) {
    this.pendingExpanded.set(this.pendingExpanded() === id ? null : id);
    this.ackNote.set('');
  }

  acknowledge(h: RmoHandover) {
    this.svc.acknowledge(h.id, this.ackNote() || undefined).subscribe({
      next: () => {
        this.toast.success('Handover acknowledged');
        this.pendingExpanded.set(null);
        this.ackNote.set('');
        this.loadPending();
        this.loadHistory();
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to acknowledge'),
    });
  }

  private loadHistory() {
    const f = this.historyFilter();
    const params: any = { limit: 100 };
    if (f === 'pending')      params.pending = 'true';
    if (f === 'acknowledged') params.pending = 'false';
    this.svc.listAuditLog(params).subscribe({
      next: r => {
        this.history.set(r.data ?? []);
        this.historyTotal.set(r.meta?.total ?? (r.data?.length ?? 0));
      },
      error: () => { this.history.set([]); this.historyTotal.set(0); },
    });
  }

  setHistoryFilter(f: 'all' | 'pending' | 'acknowledged') {
    this.historyFilter.set(f);
    this.loadHistory();
  }

  toggleHistoryExpand(id: string) {
    this.historyExpanded.set(this.historyExpanded() === id ? null : id);
  }

  /** RMO marks a consultant instruction as actioned from the picker row. */
  completeInstruction(admissionId: string, instructionId: string) {
    this.svc.completeInstruction(instructionId).subscribe({
      next: () => {
        this.toast.success('Instruction marked as done');
        this.admissions.update(list => list.map(a =>
          a.id !== admissionId ? a : { ...a, openInstructions: a.openInstructions.filter(i => i.id !== instructionId) }
        ));
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to mark done'),
    });
  }

  // ── RMO → Nursing order (forwards down the hierarchy) ──
  readonly nursingDraftFor = signal<string | null>(null);  // admissionId
  readonly nursingDraftText = signal<string>('');
  readonly nursingDraftRelated = signal<string | null>(null);  // consultant instruction id (optional)

  openNursingDraft(admissionId: string, relatedConsultantInstructionId?: string) {
    this.nursingDraftFor.set(admissionId);
    this.nursingDraftText.set('');
    this.nursingDraftRelated.set(relatedConsultantInstructionId ?? null);
  }

  closeNursingDraft() {
    this.nursingDraftFor.set(null);
    this.nursingDraftText.set('');
    this.nursingDraftRelated.set(null);
  }

  sendNursingOrder() {
    const aid = this.nursingDraftFor();
    const text = this.nursingDraftText().trim();
    if (!aid || !text) return;
    this.svc.createOrder({
      admissionId: aid,
      instruction: text,
      relatedConsultantInstructionId: this.nursingDraftRelated() ?? undefined,
    }).subscribe({
      next: () => {
        this.toast.success('Order sent to nursing');
        this.closeNursingDraft();
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to send order'),
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
