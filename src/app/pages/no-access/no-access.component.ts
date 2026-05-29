import { Component, inject } from '@angular/core';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';

@Component({
  selector: 'app-no-access',
  standalone: true,
  imports: [IconsModule, GwButtonComponent],
  templateUrl: './no-access.component.html',
  styleUrl: './no-access.component.scss',
})
export class NoAccessComponent {
  readonly auth = inject(AuthService);

  readonly roleLabels: Record<string, string> = {
    super_admin: 'Super Admin', admin: 'Admin', consultant: 'Consultant', rmo: 'RMO',
    nursing: 'Nursing', attendant: 'Attendant', ot_staff: 'OT Staff', lab_tech: 'Lab Tech',
    pharmacist: 'Pharmacist', billing_staff: 'Billing', receptionist: 'Receptionist', security: 'Security',
    doctor: 'Doctor',
  };

  get roleLabel(): string {
    const r = this.auth.role();
    return r ? (this.roleLabels[r] ?? r) : 'your role';
  }
}
