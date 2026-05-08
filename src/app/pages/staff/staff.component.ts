import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { StaffService, Staff, StaffLeave } from '../../core/services/staff.service';
import { ToastService } from '../../core/services/toast.service';

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

  readonly staff = signal<Staff[]>([]);
  readonly leaves = signal<StaffLeave[]>([]);
  readonly loading = signal(false);
  readonly activeTab = signal<'staff' | 'leaves'>('staff');
  readonly showLeaveModal = signal(false);
  readonly saving = signal(false);

  readonly leaveForm = this.fb.group({
    leaveType: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: [''],
  });

  ngOnInit() {
    this.loadStaff();
    this.loadLeaves();
  }

  loadStaff() {
    this.loading.set(true);
    this.staffService.getStaff().subscribe({
      next: r => { this.staff.set(r.data ?? []); this.loading.set(false); },
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
}
