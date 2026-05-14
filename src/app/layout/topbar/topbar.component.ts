import {
  Component, inject, signal, computed, HostListener, ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { PatientsService } from '../../core/services/patients.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { Patient } from '../../core/models/patient.models';
import { Appointment } from '../../core/models/appointment.models';

type Panel = 'search' | 'notifications' | 'profile' | null;

interface Notification {
  id: string;
  type: 'appointment' | 'invoice' | 'info';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private auth           = inject(AuthService);
  private router         = inject(Router);
  private patientsSvc    = inject(PatientsService);
  private appointmentsSvc = inject(AppointmentsService);
  private dashboardSvc   = inject(DashboardService);
  private toast          = inject(ToastService);
  private fb             = inject(FormBuilder);
  private el             = inject(ElementRef);

  readonly user      = this.auth.user;
  readonly activePanel = signal<Panel>(null);

  // ── Search ──
  readonly searchQuery   = signal('');
  readonly searchLoading = signal(false);
  readonly searchPatients = signal<Patient[]>([]);
  readonly searchAppts    = signal<Appointment[]>([]);
  private search$ = new Subject<string>();

  // ── Notifications ──
  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  // ── Change password form ──
  readonly pwForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });
  readonly pwLoading   = signal(false);
  readonly showCurrent = signal(false);
  readonly showNew     = signal(false);
  readonly profileTab  = signal<'info' | 'password'>('info');

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) {
          this.searchPatients.set([]);
          this.searchAppts.set([]);
          this.searchLoading.set(false);
          return of(null);
        }
        this.searchLoading.set(true);
        return this.patientsSvc.list({ search: q, limit: 5 });
      }),
    ).subscribe(r => {
      if (r) {
        this.searchPatients.set(r.data);
        this.searchLoading.set(false);
      }
    });

    this.loadNotifications();
  }

  // Close any open panel when clicking outside this component
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.activePanel.set(null);
    }
  }

  toggle(panel: Panel) {
    this.activePanel.update(p => p === panel ? null : panel);
  }

  onSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.searchQuery.set(q);
    this.search$.next(q);
    if (q) this.activePanel.set('search');
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchPatients.set([]);
    this.searchAppts.set([]);
    this.activePanel.set(null);
  }

  goToPatient(id: string) {
    this.activePanel.set(null);
    this.clearSearch();
    this.router.navigate(['/patients'], { queryParams: { id } });
  }

  goToAppointments() {
    this.activePanel.set(null);
    this.clearSearch();
    this.router.navigate(['/patients']);
  }

  // ── Notifications ──
  private loadNotifications() {
    // Seed with today's pending appointments as notifications
    this.appointmentsSvc.listToday().subscribe(r => {
      const notifs: Notification[] = r.data
        .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          type: 'appointment' as const,
          title: `Appointment — ${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`,
          body: `${a.startTime} · ${a.appointmentType ?? ''}`,
          time: 'Today',
          read: false,
        }));

      this.dashboardSvc.getSummary().subscribe(s => {
        if (s.data.pendingInvoicesCount > 0) {
          notifs.push({
            id: 'invoices',
            type: 'invoice',
            title: `${s.data.pendingInvoicesCount} pending invoices`,
            body: `Total outstanding: ₹${s.data.pendingInvoicesAmount.toLocaleString('en-IN')}`,
            time: 'Now',
            read: false,
          });
        }
        this.notifications.set(notifs);
      });
    });
  }

  markAllRead() {
    this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
  }

  dismissNotification(id: string) {
    this.notifications.update(ns => ns.filter(n => n.id !== id));
  }

  // ── Profile ──
  initials() {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }

  goToSettings() {
    this.activePanel.set(null);
    this.router.navigate(['/settings']);
  }

  logout() {
    this.activePanel.set(null);
    this.auth.logout();
  }

  // ── Change password ──
  changePassword() {
    if (this.pwForm.invalid || this.pwLoading()) return;
    const { currentPassword, newPassword, confirmPassword } = this.pwForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.toast.error('New passwords do not match');
      return;
    }
    this.pwLoading.set(true);
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.pwLoading.set(false);
        this.pwForm.reset();
        this.toast.success('Password changed successfully');
        this.activePanel.set(null);
      },
      error: err => {
        this.pwLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to change password');
      },
    });
  }
}
