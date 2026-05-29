import { Component, OnInit, OnDestroy, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AttendanceService, AttendanceEntry, ComplianceReport, AttendanceUser } from '../../core/services/attendance.service';
import { ToastService } from '../../core/services/toast.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';

// NABH calls out these roles as requiring bag-check at gate entry
const BAG_CHECK_ROLES = new Set(['nursing', 'rmo', 'doctor', 'consultant']);

@Component({
  selector: 'app-security-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DatePipe, GwButtonComponent],
  templateUrl: './security-entry.component.html',
  styleUrl: './security-entry.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SecurityEntryComponent implements OnInit, OnDestroy {
  private svc = inject(AttendanceService);
  private toast = inject(ToastService);


  // ── Entry form state ─────────────────────────────
  readonly query = signal('');
  readonly results = signal<AttendanceUser[]>([]);
  readonly searching = signal(false);
  readonly selected = signal<AttendanceUser | null>(null);
  readonly bagChecked = signal(true);
  readonly notes = signal('');
  readonly saving = signal(false);

  // ── Dashboard data ───────────────────────────────
  readonly insideNow = signal<AttendanceEntry[]>([]);
  readonly todaysEntries = signal<AttendanceEntry[]>([]);
  readonly compliance = signal<ComplianceReport | null>(null);
  readonly insideFilter = signal<string>('');  // role filter on the inside list

  /** True if the selected staff's role requires bag-check per NABH but it's unchecked. */
  readonly bagWarning = computed(() => {
    const s = this.selected();
    if (!s) return false;
    return BAG_CHECK_ROLES.has(s.role) && !this.bagChecked();
  });

  /** Compliance — only show roles that had at least one entry today. */
  readonly visibleCompliance = computed(() => {
    const c = this.compliance();
    if (!c) return [];
    return c.perRole.filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total);
  });

  /** Currently inside — filterable by role. */
  readonly filteredInside = computed(() => {
    const f = this.insideFilter();
    const list = this.insideNow();
    if (!f) return list;
    return list.filter(e => e.user?.role === f);
  });

  /** Distinct roles present in the "inside" list — for filter pills. */
  readonly insideRoles = computed(() => {
    const counts = new Map<string, number>();
    for (const e of this.insideNow()) {
      const r = e.user?.role;
      if (!r) continue;
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([role, count]) => ({ role, count }));
  });

  /** Overall stats for the top stat row. */
  readonly stats = computed(() => {
    const inside = this.insideNow().length;
    const today  = this.todaysEntries().length;
    const c = this.compliance();
    const total = c?.perRole.reduce((a, r) => a + r.total, 0) ?? 0;
    const checked = c?.perRole.reduce((a, r) => a + r.checked, 0) ?? 0;
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
    const missed = total - checked;
    return { inside, today, pct, missed };
  });

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  readonly roleLabels: Record<string, string> = {
    admin: 'Admin', super_admin: 'Super Admin', doctor: 'Doctor', consultant: 'Consultant',
    rmo: 'RMO', nursing: 'Nursing', attendant: 'Attendant', ot_staff: 'OT Staff',
    lab_tech: 'Lab Tech', pharmacist: 'Pharmacist', billing_staff: 'Billing',
    receptionist: 'Receptionist', security: 'Security',
  };

  ngOnInit() {
    this.refreshAll();
    this.search$.pipe(
      debounceTime(220),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(q => this.runSearch(q));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string) {
    this.query.set(value);
    this.search$.next(value);
  }

  private runSearch(q: string) {
    if (q.trim().length < 2) {
      this.results.set([]);
      return;
    }
    this.searching.set(true);
    this.svc.searchStaff(q.trim()).subscribe({
      next: list => {
        this.results.set(list);
        this.searching.set(false);
      },
      error: () => { this.searching.set(false); this.results.set([]); },
    });
  }

  pick(s: AttendanceUser) {
    this.selected.set(s);
    this.results.set([]);
    this.query.set(`${s.firstName} ${s.lastName}`);
    this.bagChecked.set(BAG_CHECK_ROLES.has(s.role));
  }

  clearSelection() {
    this.selected.set(null);
    this.query.set('');
    this.notes.set('');
    this.bagChecked.set(true);
  }

  recordEntry() {
    const s = this.selected();
    if (!s || this.saving()) return;
    this.saving.set(true);
    this.svc.createEntry({
      userId: s.id,
      bagChecked: this.bagChecked(),
      notes: this.notes() || undefined,
    }).subscribe({
      next: () => {
        this.toast.success(`Entry recorded for ${s.firstName} ${s.lastName}`);
        this.saving.set(false);
        this.clearSelection();
        this.refreshAll();
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Failed to record entry');
        this.saving.set(false);
      },
    });
  }

  markExit(entry: AttendanceEntry) {
    this.svc.markExit(entry.id).subscribe({
      next: () => {
        this.toast.success(`Exit recorded for ${entry.user?.firstName} ${entry.user?.lastName}`);
        this.refreshAll();
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to record exit'),
    });
  }

  setInsideFilter(role: string) {
    this.insideFilter.set(this.insideFilter() === role ? '' : role);
  }

  private refreshAll() {
    this.svc.listOpen().subscribe({ next: r => this.insideNow.set(r), error: () => {} });
    this.svc.compliance().subscribe({ next: r => this.compliance.set(r), error: () => {} });
    this.svc.list({ limit: 200 }).subscribe({
      next: r => this.todaysEntries.set(r.data ?? []),
      error: () => this.todaysEntries.set([]),
    });
  }

  roleLabel(role: string | undefined | null): string {
    if (!role) return '';
    return this.roleLabels[role] ?? role;
  }

  initials(u: AttendanceUser | null | undefined): string {
    if (!u) return '';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  /** Color seed for the avatar pill — keeps each role visually distinct. */
  roleHue(role: string | undefined | null): number {
    if (!role) return 220;
    let h = 0;
    for (let i = 0; i < role.length; i++) h = (h * 31 + role.charCodeAt(i)) >>> 0;
    return h % 360;
  }
}
