import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type Tab = 'profile' | 'security' | 'clinic';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  readonly auth  = inject(AuthService);
  readonly toast = inject(ToastService);
  private fb     = inject(FormBuilder);

  readonly activeTab   = signal<Tab>('profile');
  readonly pwLoading   = signal(false);
  readonly showCurrent = signal(false);
  readonly showNew     = signal(false);
  readonly showConfirm = signal(false);

  readonly pwForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile',  label: 'Profile',       icon: 'user'       },
    { id: 'security', label: 'Security',       icon: 'shield-check' },
    { id: 'clinic',   label: 'Clinic Info',    icon: 'building-2' },
  ];

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
        this.toast.success('Password updated successfully');
      },
      error: err => {
        this.pwLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to update password');
      },
    });
  }
}
