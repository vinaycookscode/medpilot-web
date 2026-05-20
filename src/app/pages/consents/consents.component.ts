import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { ConsentsService, AbhaConsent, ConsentSummary } from '../../core/services/consents.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-consents',
  standalone: true,
  imports: [IconsModule, DatePipe],
  templateUrl: './consents.component.html',
  styleUrl: './consents.component.scss',
})
export class ConsentsComponent implements OnInit {
  private consentsService = inject(ConsentsService);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly consents  = signal<AbhaConsent[]>([]);
  readonly summary   = signal<ConsentSummary>({ REQUESTED: 0, GRANTED: 0, REVOKED: 0, EXPIRED: 0 });
  readonly loading   = signal(false);
  readonly saving    = signal(false);
  readonly total     = signal(0);
  readonly page      = signal(1);
  readonly pageSize  = 20;

  readonly filterStatus = signal<string>('');
  readonly searchQuery  = signal('');
  private searchTimer: any;

  readonly selected = signal<AbhaConsent | null>(null);

  ngOnInit() {
    this.loadSummary();
    this.load();
  }

  load() {
    this.loading.set(true);
    this.consentsService.list({
      status: this.filterStatus() || undefined,
      search: this.searchQuery() || undefined,
      page: this.page(),
      limit: this.pageSize,
    }).subscribe({
      next: (res: any) => {
        this.consents.set(res.data?.data ?? res.data ?? []);
        this.total.set(res.data?.meta?.total ?? res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.show('Failed to load consents', 'danger'); },
    });
  }

  loadSummary() {
    this.consentsService.summary().subscribe({
      next: (res: any) => this.summary.set(res.data ?? res),
      error: () => {},
    });
  }

  onSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.searchQuery.set(q);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 350);
  }

  setStatus(status: string) {
    this.filterStatus.set(status);
    this.page.set(1);
    this.load();
  }

  openDetail(consent: AbhaConsent) {
    this.selected.set(consent);
  }

  closeDetail() { this.selected.set(null); }

  toggleFlag(consent: AbhaConsent) {
    if (!this.auth.isAdmin()) return;
    this.saving.set(true);
    this.consentsService.flag(consent.id).subscribe({
      next: (res: any) => {
        this.saving.set(false);
        const updated = res.data ?? res;
        this.consents.update(list => list.map(c => c.id === updated.id ? updated : c));
        if (this.selected()?.id === updated.id) this.selected.set(updated);
        this.toast.show(updated.isFlagged ? 'Marked as suspicious' : 'Flag removed', 'success');
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to update flag', 'danger'); },
    });
  }

  get totalPages() { return Math.ceil(this.total() / this.pageSize); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.load(); } }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      REQUESTED: 'badge--warning',
      GRANTED:   'badge--success',
      REVOKED:   'badge--danger',
      EXPIRED:   'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }

  purposeLabel(code: string): string {
    const map: Record<string, string> = {
      CAREMGT: 'Care Mgmt', BTG: 'Emergency', PUBHLTH: 'Public Health',
      HPAYMT: 'Health Payment', DSRCH: 'Research', PATRQT: 'Patient Request',
    };
    return map[code] ?? code;
  }

  hiTypesLabel(types: string[]): string {
    return (types ?? []).join(', ') || '—';
  }

  dateRangeLabel(from: string | null, to: string | null): string {
    if (!from && !to) return '—';
    const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '?';
    return `${fmt(from)} – ${fmt(to)}`;
  }
}
