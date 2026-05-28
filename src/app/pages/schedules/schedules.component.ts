import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconsModule } from '../../shared/icons';
import { SchedulesService } from '../../core/services/schedules.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/api.models';
import { DoctorSchedule, ScheduleOverride, DAYS, DAY_LABELS, DayOfWeek } from '../../core/models/schedule.models';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';

interface Doctor { id: string; firstName: string; lastName: string; specialization?: string; }

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [FormsModule, IconsModule, GwButtonComponent],
  templateUrl: './schedules.component.html',
  styleUrl: './schedules.component.scss',
})
export class SchedulesComponent implements OnInit {
  private schedulesService = inject(SchedulesService);
  private toast   = inject(ToastService);
  private http    = inject(HttpClient);

  readonly DAYS      = DAYS;
  readonly DAY_LABELS = DAY_LABELS;

  readonly loading      = signal(true);
  readonly saving       = signal(false);
  readonly doctors      = signal<Doctor[]>([]);
  readonly selectedDoc  = signal<Doctor | null>(null);
  readonly schedules    = signal<DoctorSchedule[]>([]);
  readonly showOverride = signal(false);

  // Override form
  overrideDate    = '';
  overrideIsDayOff = true;
  overrideStart   = '';
  overrideEnd     = '';
  overrideReason  = '';

  // Schedule edit state — keyed by dayOfWeek
  editMap = signal<Record<string, Partial<DoctorSchedule & { enabled: boolean }>>>({});

  readonly scheduleByDay = computed(() => {
    const map: Record<string, DoctorSchedule | null> = {};
    DAYS.forEach(d => map[d] = null);
    this.schedules().forEach(s => { map[s.dayOfWeek] = s; });
    return map;
  });

  ngOnInit() {
    this.http.get<ApiResponse<Doctor[]>>(`${environment.apiUrl}/users?role=doctor`)
      .subscribe({
        next: r => {
          this.doctors.set(r.data ?? []);
          if (r.data?.length) this.selectDoctor(r.data[0]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  selectDoctor(doc: Doctor) {
    this.selectedDoc.set(doc);
    this.schedules.set([]);
    this.schedulesService.getSchedule(doc.id).subscribe({
      next: r => {
        this.schedules.set(r.data ?? []);
        this.resetEditMap();
      },
    });
  }

  private resetEditMap() {
    const map: Record<string, any> = {};
    DAYS.forEach(day => {
      const existing = this.scheduleByDay()[day];
      map[day] = existing
        ? { enabled: true, startTime: existing.startTime, endTime: existing.endTime, slotDuration: existing.slotDuration, maxPatients: existing.maxPatients }
        : { enabled: false, startTime: '09:00', endTime: '17:00', slotDuration: 20, maxPatients: 20 };
    });
    this.editMap.set(map);
  }

  getDayEdit(day: DayOfWeek) { return this.editMap()[day]; }

  toggleDay(day: DayOfWeek) {
    const m = { ...this.editMap() };
    m[day] = { ...m[day], enabled: !m[day].enabled };
    this.editMap.set(m);
  }

  updateDayField(day: DayOfWeek, field: string, value: any) {
    const m = { ...this.editMap() };
    m[day] = { ...m[day], [field]: value };
    this.editMap.set(m);
  }

  saveSchedules() {
    const doc = this.selectedDoc();
    if (!doc) return;
    this.saving.set(true);

    const enabledDays = DAYS.filter(d => this.editMap()[d]?.enabled);
    if (!enabledDays.length) { this.saving.set(false); return; }

    let done = 0;
    enabledDays.forEach(day => {
      const e = this.editMap()[day];
      this.schedulesService.setSchedule(doc.id, {
        dayOfWeek: day as DayOfWeek,
        startTime: e.startTime,
        endTime: e.endTime,
        slotDuration: e.slotDuration ?? 20,
        maxPatients: e.maxPatients ?? 20,
      }).subscribe({
        next: () => {
          done++;
          if (done === enabledDays.length) {
            this.saving.set(false);
            this.toast.show('Schedule saved', 'success');
            this.selectDoctor(doc);
          }
        },
        error: () => { this.saving.set(false); this.toast.show('Failed to save', 'danger'); },
      });
    });
  }

  addOverride() {
    const doc = this.selectedDoc();
    if (!doc || !this.overrideDate) return;
    this.schedulesService.addOverride(doc.id, {
      overrideDate: this.overrideDate,
      isDayOff: this.overrideIsDayOff,
      startTime: this.overrideIsDayOff ? undefined : this.overrideStart,
      endTime: this.overrideIsDayOff ? undefined : this.overrideEnd,
      reason: this.overrideReason,
    }).subscribe({
      next: () => {
        this.toast.show('Override added', 'success');
        this.showOverride.set(false);
        this.overrideDate = '';
        this.overrideReason = '';
      },
      error: () => this.toast.show('Failed to add override', 'danger'),
    });
  }
}
