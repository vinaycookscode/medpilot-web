import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { DashboardService } from '../../core/services/dashboard.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { DashboardSummary, RevenueData, AppointmentStatusCount } from '../../core/models/dashboard.models';
import { Appointment } from '../../core/models/appointment.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, RouterLink, IconsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardSvc    = inject(DashboardService);
  private appointmentsSvc = inject(AppointmentsService);
  readonly auth           = inject(AuthService);

  readonly summary    = signal<DashboardSummary | null>(null);
  readonly revenue    = signal<RevenueData | null>(null);
  readonly apptStats  = signal<AppointmentStatusCount[]>([]);
  readonly todayQueue = signal<Appointment[]>([]);
  readonly loading    = signal(true);
  readonly revPeriod  = signal<'today' | 'week' | 'month' | 'year'>('month');

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.dashboardSvc.getSummary().subscribe(r => this.summary.set(r.data));
    this.dashboardSvc.getRevenue(this.revPeriod()).subscribe(r => this.revenue.set(r.data));
    // Returns ApiResponse<AppointmentStatusCount[]>
    this.dashboardSvc.getAppointmentStats().subscribe(r => this.apptStats.set(r.data as any));
    this.appointmentsSvc.listToday().subscribe({
      next: r  => { this.todayQueue.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setPeriod(p: 'today' | 'week' | 'month' | 'year') {
    this.revPeriod.set(p);
    this.dashboardSvc.getRevenue(p).subscribe(r => this.revenue.set(r.data));
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      scheduled:   'badge--neutral',
      confirmed:   'badge--primary',
      checked_in:  'badge--teal',
      in_progress: 'badge--warning',
      completed:   'badge--success',
      cancelled:   'badge--danger',
      no_show:     'badge--danger',
    };
    return map[status] ?? 'badge--neutral';
  }

  formatCurrency(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
  }

  today() {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // Convert [{ status, count }] array to chart rows
  buildStatRows(stats: AppointmentStatusCount[]) {
    const byStatus: Record<string, number> = {};
    stats.forEach(s => { byStatus[s.status] = Number(s.count); });
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
    return [
      { label: 'Completed',   value: byStatus['completed']   ?? 0, color: 'var(--color-success)' },
      { label: 'In Progress', value: byStatus['in_progress'] ?? 0, color: 'var(--color-warning)' },
      { label: 'Confirmed',   value: byStatus['confirmed']   ?? 0, color: 'var(--color-primary)' },
      { label: 'Scheduled',   value: byStatus['scheduled']   ?? 0, color: 'var(--border-strong)' },
      { label: 'Cancelled',   value: byStatus['cancelled']   ?? 0, color: 'var(--color-danger)' },
    ].map(r => ({ ...r, pct: Math.round((r.value / total) * 100) }));
  }

  totalAppts() {
    return this.apptStats().reduce((a, s) => a + Number(s.count), 0);
  }
}
