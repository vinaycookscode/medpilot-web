import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwPasswordInputComponent } from '../../shared/ui/forms/password-input/password-input.component';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwAlertComponent } from '../../shared/ui/feedback/alert/alert.component';

@Component({
  selector: 'app-super-admin-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconsModule,
    GwFormFieldComponent, GwInputComponent, GwPasswordInputComponent,
    GwButtonComponent, GwAlertComponent,
  ],
  templateUrl: './super-admin-login.component.html',
  styleUrl: './super-admin-login.component.scss',
})
export class SuperAdminLoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email:    ['super@super.com', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading      = signal(false);
  readonly errorMessage = signal('');

  onSubmit() {
    if (this.form.invalid || this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.auth.role() === 'super_admin') {
          this.router.navigate(['/super-admin']);
        } else {
          this.auth.logout();
          this.errorMessage.set('This portal is for Super Admins only.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Invalid credentials');
      },
    });
  }
}
