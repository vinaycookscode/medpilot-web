import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { noAccessGuard } from './core/guards/no-access.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'showcase',
    loadComponent: () => import('./pages/showcase/showcase.component').then(m => m.ShowcaseComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'super-admin-login',
    loadComponent: () => import('./pages/super-admin-login/super-admin-login.component').then(m => m.SuperAdminLoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [permissionGuard],
        data: { module: 'dashboard' },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'patients',
        canActivate: [permissionGuard],
        data: { module: 'patients' },
        loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
      },
      {
        path: 'appointments',
        canActivate: [permissionGuard],
        data: { module: 'appointments' },
        loadComponent: () => import('./pages/appointments/appointments.component').then(m => m.AppointmentsComponent),
      },
      {
        path: 'billing',
        canActivate: [permissionGuard],
        data: { module: 'billing' },
        loadComponent: () => import('./pages/billing/billing.component').then(m => m.BillingComponent),
      },
      {
        path: 'prescriptions',
        canActivate: [permissionGuard],
        data: { module: 'prescriptions' },
        loadComponent: () => import('./pages/prescriptions/prescriptions.component').then(m => m.PrescriptionsComponent),
      },
      {
        path: 'followups',
        canActivate: [permissionGuard],
        data: { module: 'appointments' },
        loadComponent: () => import('./pages/followups/followups.component').then(m => m.FollowupsComponent),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { module: 'settings' },
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'schedules',
        canActivate: [permissionGuard],
        data: { module: 'schedules' },
        loadComponent: () => import('./pages/schedules/schedules.component').then(m => m.SchedulesComponent),
      },
      {
        path: 'inventory',
        canActivate: [permissionGuard],
        data: { module: 'inventory' },
        loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.InventoryComponent),
      },
      {
        path: 'branches',
        canActivate: [permissionGuard],
        data: { module: 'settings' },
        loadComponent: () => import('./pages/branches/branches.component').then(m => m.BranchesComponent),
      },
      {
        path: 'staff',
        canActivate: [permissionGuard],
        data: { module: 'staff' },
        loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent),
      },
      {
        path: 'notifications',
        canActivate: [permissionGuard],
        data: { module: 'notifications' },
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { module: 'reports' },
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'labs',
        canActivate: [permissionGuard],
        data: { module: 'labs' },
        loadComponent: () => import('./pages/labs/labs.component').then(m => m.LabsComponent),
      },
      {
        path: 'investigations',
        canActivate: [permissionGuard],
        data: { module: 'investigations' },
        loadComponent: () => import('./pages/investigations/investigations.component').then(m => m.InvestigationsComponent),
      },
      {
        path: 'pharmacy',
        canActivate: [permissionGuard],
        data: { module: 'pharmacy' },
        loadComponent: () => import('./pages/pharmacy/pharmacy.component').then(m => m.PharmacyComponent),
      },
      {
        path: 'insurance',
        canActivate: [permissionGuard],
        data: { module: 'insurance' },
        loadComponent: () => import('./pages/insurance/insurance.component').then(m => m.InsuranceComponent),
      },
      {
        path: 'journey',
        canActivate: [permissionGuard],
        data: { module: 'encounters' },
        loadComponent: () => import('./pages/journey/journey.component').then(m => m.JourneyComponent),
      },
      {
        path: 'journey/:id',
        canActivate: [permissionGuard],
        data: { module: 'encounters' },
        loadComponent: () => import('./pages/journey/journey-detail.component').then(m => m.JourneyDetailComponent),
      },
      {
        path: 'nursing/board',
        canActivate: [permissionGuard],
        data: { module: 'encounters' },
        loadComponent: () => import('./pages/nursing-board/nursing-board.component').then(m => m.NursingBoardComponent),
      },
      {
        path: 'opd',
        canActivate: [permissionGuard],
        data: { module: 'opd' },
        loadComponent: () => import('./pages/opd/opd.component').then(m => m.OpdComponent),
      },
      {
        path: 'ipd',
        canActivate: [permissionGuard],
        data: { module: 'ipd' },
        loadComponent: () => import('./pages/ipd/ipd.component').then(m => m.IpdComponent),
      },
      {
        path: 'ipd/admission/:id',
        canActivate: [permissionGuard],
        data: { module: 'ipd' },
        loadComponent: () => import('./pages/ipd/admission-detail/admission-detail.component').then(m => m.AdmissionDetailComponent),
      },
      {
        path: 'super-admin',
        loadComponent: () => import('./pages/super-admin/super-admin.component').then(m => m.SuperAdminComponent),
      },
      {
        path: 'security/entry',
        canActivate: [permissionGuard],
        data: { module: 'attendance' },
        loadComponent: () => import('./pages/security-entry/security-entry.component').then(m => m.SecurityEntryComponent),
      },
      {
        path: 'nursing/handover',
        canActivate: [permissionGuard],
        data: { module: 'ipd' },
        loadComponent: () => import('./pages/nursing-handover/nursing-handover.component').then(m => m.NursingHandoverComponent),
      },
      {
        path: 'rmo/handover',
        canActivate: [permissionGuard],
        data: { module: 'ipd' },
        loadComponent: () => import('./pages/rmo-handover/rmo-handover.component').then(m => m.RmoHandoverComponent),
      },
      {
        path: 'consultant/rounds',
        canActivate: [permissionGuard],
        data: { module: 'ipd' },
        loadComponent: () => import('./pages/consultant-rounds/consultant-rounds.component').then(m => m.ConsultantRoundsComponent),
      },
      {
        path: 'attendant/tasks',
        canActivate: [permissionGuard],
        data: { module: 'ipd' },
        loadComponent: () => import('./pages/attendant-tasks/attendant-tasks.component').then(m => m.AttendantTasksComponent),
      },
      {
        path: 'no-access',
        canActivate: [noAccessGuard],
        loadComponent: () => import('./pages/no-access/no-access.component').then(m => m.NoAccessComponent),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
