import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';

interface NavItem {
  label: string;
  route: string;
  icon: any;
  roles?: string[];
  /** Permission module key — item hidden when user lacks canView for this module. */
  module?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconsModule],
  template: `
    <div class="sidebar">
      <!-- Brand -->
      <div class="sidebar__brand">
        <div class="sidebar__brand-icon">
          <lucide-icon name="stethoscope" [size]="20" />
        </div>
        <div class="sidebar__brand-text">
          <span class="sidebar__brand-name">GotWell</span>
          <span class="sidebar__brand-clinic">{{ user()?.clinicId ? 'Demo Clinic' : '' }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        @for (section of visibleSections(); track section.title) {
          <div class="sidebar__section">
            <span class="sidebar__section-title">{{ section.title }}</span>
            @for (item of section.items; track item.route) {
              <a class="sidebar__nav-item"
                 [routerLink]="item.route"
                 routerLinkActive="sidebar__nav-item--active"
                 [routerLinkActiveOptions]="{ exact: item.route === '/' }">
                <lucide-icon [name]="item.icon" [size]="17" />
                <span>{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>

      <!-- Bottom: user profile -->
      <div class="sidebar__footer">
        <div class="sidebar__user">
          <div class="avatar avatar--sm">
            {{ userInitials() }}
          </div>
          <div class="sidebar__user-info min-w-0">
            <span class="sidebar__user-name truncate">{{ user()?.firstName }} {{ user()?.lastName }}</span>
            <span class="sidebar__user-role">{{ user()?.role }}</span>
          </div>
        </div>
        <button class="sidebar__logout btn btn--ghost btn--icon" (click)="auth.logout()" title="Sign out">
          <lucide-icon name="log-out" [size]="16" />
        </button>
      </div>
    </div>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  private readonly appMeta = inject(AppMetaService);
  readonly user = this.auth.user;

  readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  });

  private readonly sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard', module: 'dashboard' },
      ],
    },
    {
      title: 'Patient Care',
      items: [
        { label: 'Patients',      route: '/patients',      icon: 'users',          module: 'patients' },
        { label: 'Appointments',  route: '/appointments',  icon: 'calendar',       module: 'appointments' },
        { label: 'OPD Queue',     route: '/opd',           icon: 'clipboard-list', roles: ['admin', 'receptionist', 'doctor'], module: 'opd' },
        { label: 'IPD',           route: '/ipd',           icon: 'bed',            roles: ['admin', 'doctor'], module: 'ipd' },
        { label: 'Follow-ups',    route: '/followups',     icon: 'calendar-check', roles: ['admin', 'receptionist'], module: 'appointments' },
      ],
    },
    {
      title: 'Clinical',
      items: [
        { label: 'Prescriptions', route: '/prescriptions', icon: 'file-text',     roles: ['admin', 'doctor'], module: 'prescriptions' },
        { label: 'Labs',          route: '/labs',           icon: 'flask-conical', roles: ['admin', 'doctor'], module: 'labs' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Billing',   route: '/billing',   icon: 'receipt',      roles: ['admin'], module: 'billing' },
        { label: 'Insurance', route: '/insurance', icon: 'shield-check', roles: ['admin', 'receptionist'], module: 'insurance' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Inventory', route: '/inventory', icon: 'package',    roles: ['admin'], module: 'inventory' },
        { label: 'Schedules', route: '/schedules', icon: 'clock',      roles: ['admin'], module: 'schedules' },
        { label: 'Staff',     route: '/staff',     icon: 'user-check', roles: ['admin'], module: 'staff' },
        { label: 'Branches',  route: '/branches',  icon: 'building-2', roles: ['admin'], module: 'settings' },
        { label: 'Reports',   route: '/reports',   icon: 'chart-bar',  roles: ['admin'], module: 'reports' },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Notifications', route: '/notifications', icon: 'bell',     roles: ['admin', 'doctor'], module: 'notifications' },
        { label: 'Settings',      route: '/settings',      icon: 'settings', roles: ['admin', 'doctor'], module: 'settings' },
        { label: 'Super Admin',   route: '/super-admin',   icon: 'shield-check', roles: ['super_admin'] },
      ],
    },
  ];

  readonly visibleSections = computed(() => {
    const role = this.auth.role();
    // Read the permissions signal so this computed reactively re-runs when
    // /app-meta is refreshed (e.g. after Super Admin updates the matrix).
    const perms = this.appMeta.permissions();
    const isSuper = role === 'super_admin';
    return this.sections
      .map(s => ({
        ...s,
        items: s.items.filter(i => {
          // Role gate
          if (i.roles && !(role && i.roles.includes(role))) return false;
          // Permission gate — skip for super_admin (bypass) and items without a module key
          if (!i.module || isSuper) return true;
          return perms[i.module]?.canView === true;
        }),
      }))
      .filter(s => s.items.length > 0);
  });
}
