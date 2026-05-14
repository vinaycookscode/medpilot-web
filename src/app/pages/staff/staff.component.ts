import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { StaffService, Staff, StaffLeave } from '../../core/services/staff.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IconsModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss',
})
export class StaffComponent implements OnInit {
  private staffService = inject(StaffService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly staff = signal<Staff[]>([]);
  readonly leaves = signal<StaffLeave[]>([]);
  readonly loading = signal(false);
  readonly activeTab = signal<'staff' | 'leaves'>('staff');
  readonly showLeaveModal = signal(false);
  readonly showStaffModal = signal(false);
  readonly saving = signal(false);

  // Staff grid sort
  readonly staffSortCol = signal<'name' | 'role'>('name');
  readonly staffSortDir = signal<'asc' | 'desc'>('asc');

  readonly sortedStaff = computed(() => {
    const col = this.staffSortCol();
    const dir = this.staffSortDir();
    return [...this.staff()].sort((a, b) => {
      const av = col === 'name' ? `${a.firstName} ${a.lastName}` : a.role;
      const bv = col === 'name' ? `${b.firstName} ${b.lastName}` : b.role;
      const cmp = av.localeCompare(bv);
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  // Leaves table sort + pagination
  readonly leavesSortCol = signal<string>('startDate');
  readonly leavesSortDir = signal<'asc' | 'desc'>('desc');
  readonly leavesPage = signal(1);
  readonly leavesPageSize = signal(15);

  readonly sortedLeaves = computed(() => {
    const col = this.leavesSortCol();
    const dir = this.leavesSortDir();
    return [...this.leaves()].sort((a, b) => {
      const av = col === 'staffName' ? this.getStaffName(a) : (a as any)[col] ?? '';
      const bv = col === 'staffName' ? this.getStaffName(b) : (b as any)[col] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  readonly pagedLeaves = computed(() => {
    const page = this.leavesPage();
    const size = this.leavesPageSize();
    return this.sortedLeaves().slice((page - 1) * size, page * size);
  });

  get leavesTotalPages() { return Math.ceil(this.leaves().length / this.leavesPageSize()); }
  leavesPrevPage() { if (this.leavesPage() > 1) this.leavesPage.update(p => p - 1); }
  leavesNextPage() { if (this.leavesPage() < this.leavesTotalPages) this.leavesPage.update(p => p + 1); }
  changeLeavesPageSize(n: number) { this.leavesPageSize.set(n); this.leavesPage.set(1); }

  readonly leaveForm = this.fb.group({
    leaveType: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: [''],
  });

  readonly staffForm = this.fb.group({
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    password:       ['', [Validators.required, Validators.minLength(6)]],
    role:           ['doctor', Validators.required],
    phone:          [''],
    specialization: [''],
    qualification:  [''],
    registrationNo: [''],
    consultationFee:[''],
  });

  ngOnInit() {
    this.loadStaff();
    this.loadLeaves();
  }

  loadStaff() {
    this.loading.set(true);
    this.staffService.getStaff().subscribe({
      next: (r: any) => {
        const data = r.data?.data ?? r.data ?? [];
        this.staff.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadLeaves() {
    this.staffService.getLeaves().subscribe({
      next: r => this.leaves.set(r.data ?? []),
      error: () => {},
    });
  }

  openLeaveModal() {
    this.leaveForm.reset();
    this.showLeaveModal.set(true);
  }

  closeLeaveModal() {
    this.showLeaveModal.set(false);
    this.leaveForm.reset();
  }

  openStaffModal() {
    this.staffForm.reset({ role: 'doctor' });
    this.showStaffModal.set(true);
  }

  closeStaffModal() {
    this.showStaffModal.set(false);
    this.staffForm.reset();
  }

  get selectedRole() { return this.staffForm.get('role')?.value ?? ''; }

  submitStaff() {
    if (this.staffForm.invalid || this.saving()) return;
    this.saving.set(true);
    const raw = this.staffForm.getRawValue();
    const payload: any = {
      firstName: raw.firstName,
      lastName:  raw.lastName,
      email:     raw.email,
      password:  raw.password,
      role:      raw.role,
    };
    if (raw.phone) payload.phone = raw.phone;
    if (raw.role === 'doctor') {
      if (raw.specialization) payload.specialization = raw.specialization;
      if (raw.qualification)  payload.qualification  = raw.qualification;
      if (raw.registrationNo) payload.registrationNo = raw.registrationNo;
      if (raw.consultationFee) payload.consultationFee = Number(raw.consultationFee);
    }
    this.staffService.createStaff(payload).subscribe({
      next: r => {
        this.staff.update(list => [r.data, ...list]);
        this.saving.set(false);
        this.showStaffModal.set(false);
        this.toast.show('Staff member added', 'success');
      },
      error: err => {
        this.saving.set(false);
        this.toast.show(err?.error?.message ?? 'Failed to add staff', 'danger');
      },
    });
  }

  submitLeave() {
    if (this.leaveForm.invalid) return;
    this.saving.set(true);
    this.staffService.createLeave(this.leaveForm.value as Partial<StaffLeave>).subscribe({
      next: () => {
        this.saving.set(false);
        this.showLeaveModal.set(false);
        this.toast.show('Leave request submitted', 'success');
        this.loadLeaves();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to submit leave', 'danger'); },
    });
  }

  updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
    this.staffService.updateLeaveStatus(id, status).subscribe({
      next: () => {
        this.toast.show(`Leave ${status}`, 'success');
        this.loadLeaves();
      },
      error: () => this.toast.show('Failed to update status', 'danger'),
    });
  }

  getAvatarColor(role: string): string {
    switch (role) {
      case 'doctor':      return 'doctor';
      case 'receptionist': return 'receptionist';
      case 'admin':       return 'admin';
      default:            return 'default';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'doctor':       return 'var(--color-primary)';
      case 'receptionist': return 'var(--color-success)';
      case 'admin':        return 'var(--color-purple)';
      default:             return 'var(--text-secondary)';
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'doctor':       return 'badge--primary';
      case 'receptionist': return 'badge--success';
      case 'admin':        return 'badge--purple';
      default:             return 'badge--neutral';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved': return 'badge--success';
      case 'rejected': return 'badge--danger';
      default:         return 'badge--warning';
    }
  }

  getLeaveDuration(leave: StaffLeave): number {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }

  getStaffName(leave: StaffLeave): string {
    if (leave.user) return `${leave.user.firstName} ${leave.user.lastName}`;
    return leave.userId;
  }

  get pendingLeavesCount(): number {
    return this.leaves().filter(l => l.status === 'pending').length;
  }

  sortStaff(col: 'name' | 'role') {
    if (this.staffSortCol() === col) {
      this.staffSortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.staffSortCol.set(col);
      this.staffSortDir.set('asc');
    }
  }

  sortLeaves(col: string) {
    if (this.leavesSortCol() === col) {
      this.leavesSortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.leavesSortCol.set(col);
      this.leavesSortDir.set('asc');
    }
    this.leavesPage.set(1);
  }

  sortIcon(active: string, col: string, dir: string): string {
    if (active !== col) return 'chevrons-up-down';
    return dir === 'asc' ? 'chevron-up' : 'chevron-down';
  }
}
