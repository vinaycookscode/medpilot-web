import { Component, OnInit, OnDestroy, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { NursingService, NursingTask } from '../../core/services/nursing.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwTextareaComponent } from '../../shared/ui/forms/textarea/textarea.component';

@Component({
  selector: 'app-attendant-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DatePipe, GwButtonComponent, GwTextareaComponent],
  templateUrl: './attendant-tasks.component.html',
  styleUrl: './attendant-tasks.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AttendantTasksComponent implements OnInit, OnDestroy {
  private svc     = inject(NursingService);
  readonly auth   = inject(AuthService);
  private appMeta = inject(AppMetaService);
  private toast   = inject(ToastService);

  readonly tasks      = signal<NursingTask[]>([]);
  readonly loading    = signal(false);
  readonly category   = signal<string>('');
  readonly actioning  = signal<string | null>(null);
  readonly doneNote   = signal<string>('');
  readonly noteFor    = signal<string | null>(null);

  /** Category options from master data — clinic-configurable. */
  readonly categories = computed(() => this.appMeta.meta()?.meta['attendant_task_category'] ?? []);

  readonly filtered = computed(() => {
    const c = this.category();
    if (!c) return this.tasks();
    return this.tasks().filter(t => t.category === c);
  });

  /** Overdue if dueAt < now. */
  isOverdue(t: NursingTask): boolean {
    if (!t.dueAt) return false;
    return new Date(t.dueAt).getTime() < Date.now();
  }

  /** Counts per category for the filter pills. */
  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const t of this.tasks()) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    return counts;
  });

  readonly overdueCount = computed(() => this.tasks().filter(t => this.isOverdue(t)).length);

  private pollTimer: any = null;

  ngOnInit() {
    this.load();
    // Refresh every 30s — attendants need to see new tasks promptly
    this.pollTimer = setInterval(() => this.load(), 30000);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  load() {
    this.loading.set(true);
    this.svc.tasksForAttendant().subscribe({
      next: r => { this.tasks.set(r); this.loading.set(false); },
      error: () => { this.tasks.set([]); this.loading.set(false); },
    });
  }

  setCategory(c: string) {
    this.category.set(this.category() === c ? '' : c);
  }

  openNoteFor(taskId: string) {
    this.noteFor.set(taskId);
    this.doneNote.set('');
  }

  closeNote() {
    this.noteFor.set(null);
    this.doneNote.set('');
  }

  complete(t: NursingTask, withNote: boolean) {
    this.actioning.set(t.id);
    this.svc.completeTask(t.id, withNote ? (this.doneNote() || undefined) : undefined).subscribe({
      next: () => {
        this.toast.success('Task marked as done');
        this.actioning.set(null);
        this.closeNote();
        this.load();
      },
      error: err => {
        this.actioning.set(null);
        this.toast.error(err?.error?.message ?? 'Failed to mark done');
      },
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

  /** Time-to-due readable hint ("Due in 12m", "Overdue 8m ago"). */
  dueHint(t: NursingTask): string {
    if (!t.dueAt) return '';
    const diffMs = new Date(t.dueAt).getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const mins = Math.round(abs / 60000);
    const human = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return diffMs < 0 ? `Overdue ${human}` : `Due in ${human}`;
  }

  categoryLabel(value: string): string {
    return this.categories().find(c => c.value === value)?.label ?? value;
  }
}
