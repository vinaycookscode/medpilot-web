import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AppointmentsService } from '../../core/services/appointments.service';
import { PatientsService } from '../../core/services/patients.service';
import { Appointment, CreateAppointmentDto, AppointmentStatus, AvailableSlot } from '../../core/models/appointment.models';
import { Patient } from '../../core/models/patient.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

type ViewMode = 'today' | 'calendar';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class AppointmentsComponent implements OnInit {
  private apptSvc     = inject(AppointmentsService);
  private patientsSvc = inject(PatientsService);
  private toast       = inject(ToastService);
  readonly auth       = inject(AuthService);
  private fb          = inject(FormBuilder);

  readonly viewMode       = signal<ViewMode>('today');
  readonly appointments   = signal<Appointment[]>([]);
  readonly loading        = signal(true);
  readonly showModal      = signal(false);
  readonly saving         = signal(false);
  readonly selectedDate   = signal(this.todayStr());
  readonly availableSlots = signal<AvailableSlot[]>([]);
  readonly patients       = signal<Patient[]>([]);
  readonly slotsLoading   = signal(false);

  private patientSearch$ = new Subject<string>();

  readonly form = this.fb.nonNullable.group({
    patientId:       ['', Validators.required],
    doctorId:        ['', Validators.required],
    appointmentDate: [this.todayStr(), Validators.required],
    startTime:       ['', Validators.required],
    endTime:         [''],
    type:            ['consultation', Validators.required],
    chiefComplaint:  [''],
    notes:           [''],
  });

  readonly appointmentTypes = ['consultation', 'follow_up', 'procedure', 'emergency', 'routine_checkup'];

  ngOnInit() {
    this.load();
    this.patientSearch$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length >= 2) {
        this.patientsSvc.list({ search: q, limit: 10 }).subscribe(r => this.patients.set(r.data));
      }
    });
  }

  load() {
    this.loading.set(true);
    if (this.viewMode() === 'today') {
      this.apptSvc.listToday().subscribe({
        next: r => { this.appointments.set(r.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      const start = this.selectedDate();
      this.apptSvc.calendar(start, start).subscribe({
        next: r => { this.appointments.set(r.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  switchView(mode: ViewMode) { this.viewMode.set(mode); this.load(); }

  onDoctorOrDateChange() {
    const { doctorId, appointmentDate } = this.form.getRawValue();
    if (doctorId && appointmentDate) {
      this.slotsLoading.set(true);
      this.apptSvc.getAvailableSlots(doctorId, appointmentDate).subscribe({
        next: r => { this.availableSlots.set(r.data.filter(s => s.available)); this.slotsLoading.set(false); },
        error: () => this.slotsLoading.set(false),
      });
    }
  }

  selectSlot(slot: AvailableSlot) {
    this.form.patchValue({ startTime: slot.startTime, endTime: slot.endTime });
  }

  onPatientSearch(event: Event) {
    this.patientSearch$.next((event.target as HTMLInputElement).value);
  }

  openCreate() {
    this.form.reset({ appointmentDate: this.todayStr(), type: 'consultation' });
    this.availableSlots.set([]);
    this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); }

  saveAppointment() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const body = this.form.getRawValue() as CreateAppointmentDto;
    this.apptSvc.create(body).subscribe({
      next: r => {
        this.appointments.update(a => [r.data, ...a]);
        this.saving.set(false);
        this.showModal.set(false);
        this.toast.success('Appointment booked');
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
        this.toast.success(`Status updated to ${status}`);
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to update status'),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'badge--neutral', confirmed: 'badge--primary',
      checked_in: 'badge--teal',  in_progress: 'badge--warning',
      completed: 'badge--success', cancelled: 'badge--danger',
      no_show: 'badge--danger',
    };
    return map[status] ?? 'badge--neutral';
  }

  onDateChange(event: Event) {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    this.load();
  }

  todayStr() { return new Date().toISOString().split('T')[0]; }

  formatTime(t: string) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
