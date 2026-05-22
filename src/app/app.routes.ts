import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'patients',
        loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./pages/appointments/appointments.component').then(m => m.AppointmentsComponent),
      },
      {
        path: 'billing',
        loadComponent: () => import('./pages/billing/billing.component').then(m => m.BillingComponent),
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./pages/prescriptions/prescriptions.component').then(m => m.PrescriptionsComponent),
      },
      {
        path: 'followups',
        loadComponent: () => import('./pages/followups/followups.component').then(m => m.FollowupsComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'schedules',
        loadComponent: () => import('./pages/schedules/schedules.component').then(m => m.SchedulesComponent),
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.InventoryComponent),
      },
      {
        path: 'branches',
        loadComponent: () => import('./pages/branches/branches.component').then(m => m.BranchesComponent),
      },
      {
        path: 'staff',
        loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'labs',
        loadComponent: () => import('./pages/labs/labs.component').then(m => m.LabsComponent),
      },
      {
        path: 'insurance',
        loadComponent: () => import('./pages/insurance/insurance.component').then(m => m.InsuranceComponent),
      },
      {
        path: 'opd',
        loadComponent: () => import('./pages/opd/opd.component').then(m => m.OpdComponent),
      },
      {
        path: 'ipd',
        loadComponent: () => import('./pages/ipd/ipd.component').then(m => m.IpdComponent),
      },
      {
        path: 'ipd/admission/:id',
        loadComponent: () => import('./pages/ipd/admission-detail/admission-detail.component').then(m => m.AdmissionDetailComponent),
      },
      {
        path: 'super-admin',
        loadComponent: () => import('./pages/super-admin/super-admin.component').then(m => m.SuperAdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
