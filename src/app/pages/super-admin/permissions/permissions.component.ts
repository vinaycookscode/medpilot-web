import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons';
import { PermissionsService, PermMatrix, RolePermUpdate } from '../../../core/services/permissions.service';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
})
export class PermissionsComponent implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly matrix = signal<PermMatrix>({});
  readonly roles = signal<string[]>([]);
  readonly modules = signal<string[]>([]);
  readonly selectedRole = signal('');
  readonly dirty = signal(false);

  // Local editable copy
  localMatrix: PermMatrix = {};

  readonly PERMS: Array<keyof RolePermUpdate> = ['canView', 'canCreate', 'canEdit', 'canApprove'];
  readonly PERM_LABELS: Record<string, string> = { canView: 'View', canCreate: 'Create', canEdit: 'Edit', canApprove: 'Approve' };

  readonly roleLabels: Record<string, string> = {
    super_admin: 'Super Admin', admin: 'Admin', consultant: 'Consultant', rmo: 'RMO',
    nursing: 'Nursing', attendant: 'Attendant', ot_staff: 'OT Staff', lab_tech: 'Lab Tech',
    pharmacist: 'Pharmacist', billing_staff: 'Billing', receptionist: 'Receptionist', security: 'Security',
  };

  readonly moduleLabels: Record<string, string> = {
    dashboard: 'Dashboard', patients: 'Patients', appointments: 'Appointments', opd: 'OPD',
    ipd: 'IPD', prescriptions: 'Prescriptions', labs: 'Labs', billing: 'Billing',
    insurance: 'Insurance', inventory: 'Inventory', schedules: 'Schedules', staff: 'Staff',
    reports: 'Reports', notifications: 'Notifications', settings: 'Settings',
    charge_master: 'Charge Master', permissions: 'Permissions', nabh: 'NABH',
  };

  constructor(private svc: PermissionsService) {}

  ngOnInit() {
    this.loading.set(true);
    this.svc.getRoles().subscribe(r => {
      this.roles.set(r);
      this.selectedRole.set(r[0] ?? '');
    });
    this.svc.getModules().subscribe(m => this.modules.set(m));
    this.svc.getMatrix().subscribe(m => {
      this.matrix.set(m);
      this.localMatrix = JSON.parse(JSON.stringify(m));
      this.loading.set(false);
    });
  }

  getPerm(role: string, mod: string, perm: string): boolean {
    return this.localMatrix[role]?.[mod]?.[perm as keyof { canView: boolean }] ?? false;
  }

  setPerm(role: string, mod: string, perm: string, val: boolean) {
    if (!this.localMatrix[role]) this.localMatrix[role] = {};
    if (!this.localMatrix[role][mod]) this.localMatrix[role][mod] = { canView: false, canCreate: false, canEdit: false, canApprove: false };
    (this.localMatrix[role][mod] as any)[perm] = val;
    this.dirty.set(true);
  }

  toggleAll(role: string, mod: string, val: boolean) {
    for (const p of this.PERMS) this.setPerm(role, mod, p as string, val);
  }

  isAllEnabled(role: string, mod: string): boolean {
    return this.PERMS.every(p => this.getPerm(role, mod, p as string));
  }

  save() {
    const role = this.selectedRole();
    const updates: RolePermUpdate[] = [];
    for (const mod of this.modules()) {
      const perms = this.localMatrix[role]?.[mod] ?? { canView: false, canCreate: false, canEdit: false, canApprove: false };
      updates.push({ role, module: mod, ...perms });
    }
    this.saving.set(true);
    this.svc.bulkUpdate(updates).subscribe({
      next: () => { this.saving.set(false); this.dirty.set(false); },
      error: () => this.saving.set(false),
    });
  }

  reset() {
    this.localMatrix = JSON.parse(JSON.stringify(this.matrix()));
    this.dirty.set(false);
  }
}
