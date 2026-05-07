import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { PrescriptionsService } from '../../core/services/prescriptions.service';
import { Prescription } from '../../core/models/prescription.models';

@Component({
  selector: 'app-followups',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, IconsModule],
  templateUrl: './followups.component.html',
  styleUrl: './followups.component.scss',
})
export class FollowupsComponent implements OnInit {
  private rxSvc = inject(PrescriptionsService);

  readonly loading  = signal(true);
  readonly overdue  = signal<Prescription[]>([]);
  readonly today    = signal<Prescription[]>([]);
  readonly upcoming = signal<Prescription[]>([]);

  readonly total = computed(() =>
    this.overdue().length + this.today().length + this.upcoming().length
  );

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.rxSvc.getFollowups(60).subscribe({
      next: r => {
        this.overdue.set(r.data.overdue);
        this.today.set(r.data.today);
        this.upcoming.set(r.data.upcoming);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  daysUntil(dateStr: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / 86400000);
  }

  daysLabel(dateStr: string): string {
    const n = this.daysUntil(dateStr);
    if (n < 0)  return `${Math.abs(n)}d overdue`;
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    return `In ${n} days`;
  }

  daysClass(dateStr: string): string {
    const n = this.daysUntil(dateStr);
    if (n < 0)  return 'followups__badge--overdue';
    if (n === 0) return 'followups__badge--today';
    if (n <= 3)  return 'followups__badge--soon';
    return 'followups__badge--upcoming';
  }
}
