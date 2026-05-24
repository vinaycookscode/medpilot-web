import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading      = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  onSubmit() {
    if (this.form.invalid || this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const role = this.auth.role();
        this.router.navigate([role === 'super_admin' ? '/super-admin' : '/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Invalid email or password');
      },
    });
  }

  togglePassword() { this.showPassword.update(v => !v); }

  fillDemo(role: 'admin' | 'doctor' | 'receptionist') {
    const creds = {
      admin:        { email: 'admin@democlinic.com',     password: 'Admin@123' },
      doctor:       { email: 'doctor@democlinic.com',    password: 'Admin@123' },
      receptionist: { email: 'reception@democlinic.com', password: 'Admin@123' },
    };
    this.form.patchValue(creds[role]);
  }
}
