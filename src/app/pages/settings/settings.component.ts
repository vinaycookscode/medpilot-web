import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwPasswordInputComponent } from '../../shared/ui/forms/password-input/password-input.component';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent } from '../../shared/ui/display/badge/badge.component';
import { GwCardComponent } from '../../shared/ui/display/card/card.component';
import { GwTabsComponent } from '../../shared/ui/navigation/tabs/tabs.component';
import { GwTabComponent } from '../../shared/ui/navigation/tabs/tab.component';

type Tab = 'profile' | 'security' | 'clinic';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IconsModule,
    GwFormFieldComponent, GwInputComponent, GwPasswordInputComponent,
    GwButtonComponent, GwBadgeComponent, GwCardComponent,
    GwTabsComponent, GwTabComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  readonly auth  = inject(AuthService);
  readonly toast = inject(ToastService);
  private fb     = inject(FormBuilder);

  readonly activeTab = signal<Tab>('profile');
  readonly pwLoading = signal(false);

  readonly pwForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  setTab(tab: string) { this.activeTab.set(tab as Tab); }

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
