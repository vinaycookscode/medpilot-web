import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AppointmentsService } from '../../core/services/appointments.service';
import { PatientsService } from '../../core/services/patients.service';
import { StaffService, Staff } from '../../core/services/staff.service';
import { Appointment, CreateAppointmentDto, AppointmentStatus, AvailableSlot } from '../../core/models/appointment.models';
import { Patient } from '../../core/models/patient.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { debounceTime, distinctUntilChanged, Subject, forkJoin } from 'rxjs';

type ViewMode = 'today' | 'calendar' | 'queue';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, FormsModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class AppointmentsComponent implements OnInit {
  private apptSvc = inject(AppointmentsService);
  private patientsSvc = inject(PatientsService);
  private staffSvc = inject(StaffService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly viewMode = signal<ViewMode>('today');
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly availableSlots = signal<AvailableSlot[]>([]);
  readonly patients = signal<Patient[]>([]);
  readonly patientSearchQuery = signal('');
  readonly patientSearching = signal(false);
  readonly newPatientMode = signal(false);
  quickPatient = { firstName: '', lastName: '', phone: '' };
  readonly slotsLoading = signal(false);
  readonly doctors = signal<Staff[]>([]);
  readonly doctorsLoading = signal(false);
  readonly selectedDoctor = signal<Staff | null>(null);
  readonly selectedPatient = signal<Patient | null>(null);

  // Today table sort + pagination
  readonly sortCol  = signal<string>('startTime');
  readonly sortDir  = signal<'asc' | 'desc'>('asc');
  readonly page     = signal(1);
  readonly pageSize = signal(20);
  readonly total    = signal(0);

  readonly sortedAppts = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir();
    return [...this.appointments()].sort((a, b) => {
      let av: any, bv: any;
      if (col === 'patient') {
        av = `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`;
        bv = `${b.patient?.firstName ?? ''} ${b.patient?.lastName ?? ''}`;
      } else if (col === 'doctor') {
        av = `${a.doctor?.firstName ?? ''} ${a.doctor?.lastName ?? ''}`;
        bv = `${b.doctor?.firstName ?? ''} ${b.doctor?.lastName ?? ''}`;
      } else {
        av = (a as any)[col] ?? '';
        bv = (b as any)[col] ?? '';
      }
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  get totalPages() { return Math.ceil(this.total() / this.pageSize()); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.loadToday(); } }
  nextPage() { if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.loadToday(); } }
  changePageSize(n: number) { this.pageSize.set(n); this.page.set(1); this.loadToday(); }

  sort(col: string) {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  sortIcon(col: string): string {
    if (this.sortCol() !== col) return 'chevrons-up-down';
    return this.sortDir() === 'asc' ? 'chevron-up' : 'chevron-down';
  }

  // Queue view
  readonly allDoctors = signal<Staff[]>([]);
  readonly queueDoctor = signal<Staff | null>(null);
  readonly doctorApptCounts = signal<Record<string, number>>({});

  // Calendar view
  readonly calendarMonth = signal<Date>(new Date());
  readonly selectedCalDay = signal<string | null>(null);
  readonly monthAppts = signal<Appointment[]>([]);
  readonly drawerPos = signal<{ x: number; y: number } | null>(null);
  readonly drawerAppts = computed(() => {
    const day = this.selectedCalDay();
    if (!day) return [];
    return this.monthAppts().filter(a => String(a.appointmentDate).substring(0, 10) === day);
  });

  readonly calendarDays = computed(() => {
    const ref = this.calendarMonth();
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const allAppts = this.monthAppts();
    const today = this.todayStr();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon

    const days: { date: string; day: number; inMonth: boolean; isToday: boolean; appts: Appointment[] }[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const ds = this.dateStr(d);
      days.push({ date: ds, day: d.getDate(), inMonth: false, isToday: false, appts: [] });
    }

    for (let d = 1; d <= totalDays; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: ds, day: d, inMonth: true, isToday: ds === today,
        appts: allAppts.filter(a => String(a.appointmentDate).substring(0, 10) === ds),
      });
    }

    while (days.length < 42) {
      const d = new Date(year, month + 1, days.length - startDow - totalDays + 1);
      const ds = this.dateStr(d);
      days.push({ date: ds, day: d.getDate(), inMonth: false, isToday: false, appts: [] });
    }

    return days;
  });

  readonly calendarRows = computed(() => {
    const days = this.calendarDays();
    const rows = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  });

  readonly doctorQueues = computed(() => {
    const appts = this.appointments();
    const doctors = this.allDoctors();
    return doctors.map(doc => ({
      doctor: doc,
      appointments: appts
        .filter(a => a.doctorId === doc.id)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
  });

  readonly queueDetailAppts = computed(() => {
    const doctor = this.queueDoctor();
    if (!doctor) return [];
    return this.appointments()
      .filter(a => a.doctorId === doctor.id)
      .sort((a, b) => (a.tokenNumber ?? Infinity) - (b.tokenNumber ?? Infinity));
  });

  readonly queueDetailStats = computed(() => this.queueStats(this.queueDetailAppts()));

  private patientSearch$ = new Subject<string>();

  readonly form = this.fb.nonNullable.group({
    patientId: [''],
    doctorId: ['', Validators.required],
    appointmentDate: [this.todayStr(), Validators.required],
    startTime: ['', Validators.required],
    appointmentType: ['new_patient'],
    chiefComplaint: [''],
    notes: [''],
  });

  readonly appointmentTypes = [
    { value: 'new_patient', label: 'New Patient' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine', label: 'Routine' },
  ];

  readonly colColors = ['primary', 'teal', 'purple', 'warning', 'success', 'rose'];
  readonly dowLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit() {
    this.load();
    this.patientSearch$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length >= 2) {
        this.patientSearching.set(true);
        this.patientsSvc.list({ search: q, limit: 10 }).subscribe({
          next: r => { this.patients.set(r.data); this.patientSearching.set(false); },
          error: () => this.patientSearching.set(false),
        });
      } else {
        this.patients.set([]);
        this.patientSearching.set(false);
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['new'] === '1') this.openCreate();
    });
  }

  loadToday() {
    this.loading.set(true);
    this.apptSvc.listToday(this.page(), this.pageSize()).subscribe({
      next: r => { this.appointments.set(r.data); this.total.set(r.meta?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  load() {
    this.loading.set(true);
    if (this.viewMode() === 'queue') {
      this.loadQueue();
    } else if (this.viewMode() === 'calendar') {
      this.loadMonth();
    } else {
      this.loadToday();
    }
  }

  loadMonth() {
    const ref = this.calendarMonth();
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const last = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
    this.apptSvc.calendar(start, end).subscribe({
      next: r => { this.monthAppts.set(r.data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load calendar'); },
    });
  }

  prevMonth() {
    const m = this.calendarMonth();
    this.calendarMonth.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
    this.selectedCalDay.set(null);
    this.drawerPos.set(null);
    this.loadMonth();
  }

  nextMonth() {
    const m = this.calendarMonth();
    this.calendarMonth.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
    this.selectedCalDay.set(null);
    this.drawerPos.set(null);
    this.loadMonth();
  }

  calendarMonthLabel() {
    return this.calendarMonth().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  selectCalDay(date: string, event: MouseEvent) {
    if (this.selectedCalDay() === date) {
      this.selectedCalDay.set(null);
      this.drawerPos.set(null);
      return;
    }

    const cell = event.currentTarget as HTMLElement;
    const calView = cell.closest('.cal-view') as HTMLElement;
    const viewRect = calView?.getBoundingClientRect() ?? { left: 0, top: 0 };

    const panelW = 300;
    const panelH = 700;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let vx = event.clientX + 12;
    let vy = event.clientY - 20;

    if (vx + panelW > vw - 12) vx = event.clientX - panelW - 12;
    if (vy + panelH > vh - 12) vy = vh - panelH - 12;
    if (vy < 12) vy = 12;
    if (vx < 12) vx = 12;

    this.drawerPos.set({ x: vx - viewRect.left, y: vy - viewRect.top });
    this.selectedCalDay.set(date);
  }

  goToToday() {
    this.calendarMonth.set(new Date());
    this.selectedCalDay.set(null);
    this.loadMonth();
  }

  formatCalendarDay(ds: string) {
    const d = new Date(ds + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  loadQueue() {
    forkJoin({
      appts: this.apptSvc.listToday(1, 200),
      doctors: this.staffSvc.getDoctors(),
    }).subscribe({
      next: ({ appts, doctors }) => {
        this.appointments.set(appts.data);
        const docData = (doctors as any).data?.data ?? doctors.data ?? [];
        this.allDoctors.set(Array.isArray(docData) ? docData : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  switchView(mode: ViewMode) {
    this.viewMode.set(mode);
    this.queueDoctor.set(null);
    if (mode === 'calendar') {
      this.calendarMonth.set(new Date());
      this.selectedCalDay.set(null);
    }
    this.load();
  }

  onDoctorOrDateChange() {
    const { doctorId, appointmentDate } = this.form.getRawValue();
    this.form.patchValue({ startTime: '' });
    this.availableSlots.set([]);
    if (doctorId && appointmentDate) {
      this.slotsLoading.set(true);
      this.apptSvc.getAvailableSlots(doctorId, appointmentDate).subscribe({
        next: r => {
          const raw = (r as any).data?.data ?? r.data ?? [];
          const isToday = appointmentDate === this.todayStr();
          const now = new Date();
          const slots = (Array.isArray(raw) ? raw : []).filter((s: any) => {
            if (!s.available) return false;
            if (isToday) {
              const [h, m] = s.startTime.split(':').map(Number);
              const slotTime = new Date();
              slotTime.setHours(h, m, 0, 0);
              return slotTime > now;
            }
            return true;
          });
          this.availableSlots.set(slots);
          if (slots.length > 0) this.form.patchValue({ startTime: slots[0].startTime });
          this.slotsLoading.set(false);
        },
        error: () => this.slotsLoading.set(false),
      });
    }
  }

  selectSlot(slot: AvailableSlot) { this.form.patchValue({ startTime: slot.startTime }); }

  onPatientSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.patientSearchQuery.set(q);
    this.newPatientMode.set(false);
    this.patientSearch$.next(q);
  }

  startNewPatient() {
    const q = this.patientSearchQuery().trim();
    const parts = q.split(/\s+/);
    this.quickPatient = {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      phone: '',
    };
    this.newPatientMode.set(true);
  }

  clearPatientSearch() {
    this.newPatientMode.set(false);
    this.patientSearchQuery.set('');
    this.patients.set([]);
  }

  get canBook(): boolean {
    const v = this.form.getRawValue();
    if (!v.doctorId || !v.appointmentDate || !v.startTime) return false;
    if (this.newPatientMode()) {
      return !!this.quickPatient.firstName.trim() && !!this.quickPatient.phone.trim();
    }
    return !!v.patientId;
  }

  openCreate(date?: string) {
    const appointmentDate = date && date >= this.todayStr() ? date : this.todayStr();
    this.form.reset({ appointmentDate, appointmentType: 'new_patient' });
    this.availableSlots.set([]);
    this.selectedDoctor.set(null);
    this.selectedPatient.set(null);
    this.patients.set([]);
    this.patientSearchQuery.set('');
    this.newPatientMode.set(false);
    this.showModal.set(true);
    this.loadDoctors();
    this.loadDoctorApptCounts();
  }

  loadDoctors() {
    this.doctorsLoading.set(true);
    this.staffSvc.getDoctors().subscribe({
      next: (r: any) => {
        const data = r.data?.data ?? r.data ?? [];
        this.doctors.set(Array.isArray(data) ? data : []);
        this.doctorsLoading.set(false);
      },
      error: () => { this.doctorsLoading.set(false); this.toast.error('Failed to load doctors'); },
    });
  }

  loadDoctorApptCounts() {
    this.apptSvc.listToday(1, 200).subscribe({
      next: r => {
        const counts: Record<string, number> = {};
        r.data.forEach((a: Appointment) => {
          if (a.doctorId) counts[a.doctorId] = (counts[a.doctorId] || 0) + 1;
        });
        this.doctorApptCounts.set(counts);
      },
      error: () => { },
    });
  }

  selectDoctor(doctor: Staff) {
    this.selectedDoctor.set(doctor);
    this.form.patchValue({ doctorId: doctor.id });
    this.onDoctorOrDateChange();
  }

  selectQueueDoctor(doctor: Staff) { this.queueDoctor.set(doctor); console.log('this.queueDoctor', this.queueDoctor); }
  clearQueueDoctor() { this.queueDoctor.set(null); }
  closeModal() { this.showModal.set(false); this.newPatientMode.set(false); }

  saveAppointment() {
    if (!this.canBook || this.saving()) return;
    this.saving.set(true);
    if (this.newPatientMode()) {
      const { firstName, lastName, phone } = this.quickPatient;
      this.patientsSvc.create({ firstName, lastName: lastName || firstName, phone } as any).subscribe({
        next: r => { this.form.patchValue({ patientId: r.data.id }); this.doBook(); },
        error: err => { this.saving.set(false); this.toast.error(err?.error?.message ?? 'Failed to register patient'); },
      });
    } else {
      this.doBook();
    }
  }

  private doBook() {
    const v = this.form.getRawValue();
    const body: CreateAppointmentDto = {
      patientId: v.patientId,
      doctorId: v.doctorId,
      appointmentDate: v.appointmentDate,
      startTime: v.startTime,
      appointmentType: v.appointmentType as any || undefined,
    };
    if (v.chiefComplaint) body.chiefComplaint = v.chiefComplaint;
    if (v.notes) body.notes = v.notes;
    this.apptSvc.create(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.toast.success('Appointment booked');
        this.loadToday();
        // Always refresh calendar so it shows the new appointment
        this.loadMonth();
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to book appointment');
      },
    });
  }

  updateStatus(id: string, status: AppointmentStatus) {
    this.apptSvc.updateStatus(id, status).subscribe({
      next: r => {
        this.appointments.update(as => as.map(a => a.id === id ? r.data : a));
        this.monthAppts.update(as => as.map(a => a.id === id ? r.data : a));
        this.toast.success('Status updated');
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to update status'),
    });
  }

  queueStats(appts: Appointment[]) {
    return {
      total: appts.length,
      waiting: appts.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
      active: appts.filter(a => a.status === 'in_progress').length,
      completed: appts.filter(a => a.status === 'completed').length,
    };
  }

  docColor(i: number) { return this.colColors[i % this.colColors.length]; }

  getInitials(first: string, last: string) {
    return `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();
  }

  formatStatus(s: string) {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'badge--neutral', confirmed: 'badge--primary',
      in_progress: 'badge--warning',
      completed: 'badge--success', cancelled: 'badge--danger',
      no_show: 'badge--danger',
    };
    return map[status] ?? 'badge--neutral';
  }

  // Use local date to avoid UTC drift in IST and other timezones
  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  dateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  isPast(startTime: string): boolean {
    if (!startTime) return false;
    const [h, m] = startTime.split(':').map(Number);
    const appt = new Date();
    appt.setHours(h, m, 0, 0);
    return new Date() > appt;
  }

  formatTime(t: string) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
