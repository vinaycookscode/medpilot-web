import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwPasswordInputComponent } from '../../shared/ui/forms/password-input/password-input.component';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwAlertComponent } from '../../shared/ui/feedback/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconsModule,
    GwFormFieldComponent, GwInputComponent, GwPasswordInputComponent,
    GwButtonComponent, GwAlertComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth    = inject(AuthService);
  private appMeta = inject(AppMetaService);
  private router  = inject(Router);
  private fb      = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
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
        const role = this.auth.role();
        if (role === 'super_admin') {
          this.router.navigate(['/super-admin']);
        } else {
          this.router.navigate([this.appMeta.firstAccessibleRoute()]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Invalid email or password');
      },
    });
  }

  fillDemo(role: 'admin' | 'doctor' | 'receptionist' | 'security') {
    const creds = {
      admin:        { email: 'admin@democlinic.com',     password: 'Admin@123' },
      doctor:       { email: 'doctor@democlinic.com',    password: 'Admin@123' },
      receptionist: { email: 'reception@democlinic.com', password: 'Admin@123' },
      security:     { email: 'security@democlinic.com',  password: 'Admin@123' },
    };
    this.form.patchValue(creds[role]);
  }
}
