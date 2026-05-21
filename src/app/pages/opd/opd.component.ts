import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { IpdService } from '../../core/services/ipd.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, AppointmentStatus, OpdQueueStats, TriageVitals } from '../../core/models/appointment.models';

type QueueFilter = '' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'no_show';

@Component({
  selector: 'app-opd',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, IconsModule],
  templateUrl: './opd.component.html',
  styleUrl: './opd.component.scss',
})
export class OpdComponent implements OnInit {
  private ipdSvc   = inject(IpdService);
  private apptSvc  = inject(AppointmentsService);
  private toast    = inject(ToastService);
  readonly auth    = inject(AuthService);

  readonly queue      = signal<Appointment[]>([]);
  readonly stats      = signal<OpdQueueStats>({ waiting: 0, inProgress: 0, completed: 0, triaged: 0 });
  readonly loading    = signal(true);
  readonly date       = signal(this.todayStr());
  readonly filter     = signal<QueueFilter>('');
  readonly page       = signal(1);
  readonly limit      = signal(20);
  readonly total      = signal(0);

  readonly triageModal  = signal(false);
  readonly triageAppt   = signal<Appointment | null>(null);
  readonly triageSaving = signal(false);
  vitals: TriageVitals = {};

  get totalPages() { return Math.max(1, Math.ceil(this.total() / this.limit())); }
  get rowOffset()  { return (this.page() - 1) * this.limit(); }
  get endRow()     { return Math.min(this.rowOffset + this.limit(), this.total()); }

  readonly filterOptions: { value: QueueFilter; label: string }[] = [
    { value: '',           label: 'All' },
    { value: 'scheduled',  label: 'Scheduled' },
    { value: 'confirmed',  label: 'Confirmed' },
    { value: 'in_progress',label: 'In Progress' },
    { value: 'completed',  label: 'Completed' },
    { value: 'no_show',    label: 'No Show' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.ipdSvc.getOpdQueue(this.date(), this.page(), this.limit(), this.filter() || undefined).subscribe({
      next: (r: any) => {
        this.queue.set(r.data ?? []);
        this.stats.set(r.stats ?? { waiting: 0, inProgress: 0, completed: 0, triaged: 0 });
        this.total.set(r.meta?.total ?? (r.data ?? []).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFilter(f: QueueFilter) {
    this.filter.set(f);
    this.page.set(1);
    this.load();
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page.set(p);
    this.load();
  }

  onDateChange(val: string) {
    this.date.set(val);
    this.page.set(1);
    this.load();
  }

  openTriage(appt: Appointment) {
    this.triageAppt.set(appt);
    this.vitals = { ...(appt.triageVitals ?? {}) };
    this.triageModal.set(true);
  }

  saveTriage() {
    const appt = this.triageAppt();
    if (!appt || this.triageSaving()) return;
    this.triageSaving.set(true);
    this.ipdSvc.triage(appt.id, this.vitals).subscribe({
      next: () => {
        this.triageModal.set(false);
        this.triageSaving.set(false);
        this.toast.success('Triage recorded');
        this.load();
      },
      error: err => {
        this.triageSaving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save triage');
      },
    });
  }

  updateStatus(id: string, status: AppointmentStatus) {
    this.apptSvc.updateStatus(id, status).subscribe({
      next: () => {
        this.toast.success('Status updated');
        this.load();
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to update'),
    });
  }

  statusClass(s: string) {
    const m: Record<string, string> = {
      scheduled: 'badge--neutral', confirmed: 'badge--primary',
      in_progress: 'badge--warning', completed: 'badge--success',
      cancelled: 'badge--danger', no_show: 'badge--danger',
    };
    return m[s] ?? 'badge--neutral';
  }

  rowClass(s: string) {
    const m: Record<string, string> = {
      in_progress: 'row--inprogress',
      completed:   'row--completed',
      no_show:     'row--noshow',
    };
    return m[s] ?? '';
  }

  formatTime(t: string) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  pageRange(): number[] {
    const total = this.totalPages;
    const cur   = this.page();
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) {
      range.push(i);
    }
    return range;
  }

  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  isToday() {
    return this.date() === this.todayStr();
  }
}
