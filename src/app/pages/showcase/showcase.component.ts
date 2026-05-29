import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent } from '../../shared/ui/display/badge/badge.component';
import { GwCardComponent } from '../../shared/ui/display/card/card.component';
import { GwAvatarComponent } from '../../shared/ui/display/avatar/avatar.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwAlertComponent } from '../../shared/ui/feedback/alert/alert.component';

interface ShowcaseFeature {
  icon: string;
  title: string;
  desc: string;
  group: 'clinical' | 'admin' | 'platform';
}

interface ShowcaseStage {
  role: string;
  name: string;
  action: string;
  detail: string;
  color: string;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    CommonModule, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwCardComponent, GwAvatarComponent,
    GwInputComponent, GwFormFieldComponent, GwAlertComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseComponent {
  private router = inject(Router);

  readonly features: ShowcaseFeature[] = [
    { icon: 'clipboard-list', title: 'OPD queue',           desc: 'Token boards, triage vitals, in-progress tracking — front desk to consultation in under a minute.', group: 'clinical' },
    { icon: 'bed',            title: 'IPD admissions',      desc: 'Bed allocation, ward maps, discharge workflows, attendant tracking for every admission.', group: 'clinical' },
    { icon: 'file-text',      title: 'Digital prescriptions', desc: 'Rx with medicine autocomplete, lab order linkage, follow-up tracking, print-ready output.', group: 'clinical' },
    { icon: 'flask-conical',  title: 'Lab orders & results', desc: 'Order, sample, result, abnormal-value alerts — connected to the patient timeline.', group: 'clinical' },
    { icon: 'pill',           title: 'Pharmacy + inventory', desc: 'Stock levels, batch + expiry tracking, low-stock alerts, dispensing audit.', group: 'clinical' },
    { icon: 'receipt',        title: 'Billing & GST',       desc: 'Invoices, partial payments, GST handling, statement-of-account by patient or insurer.', group: 'admin' },
    { icon: 'shield-check',   title: 'Insurance claims',    desc: 'Provider catalog, claim lifecycle, approval state, integration-ready APIs.', group: 'admin' },
    { icon: 'users',          title: 'Clinical handovers',  desc: 'The consultant → RMO → nursing → attendant chain, with sign-off and traceability at every hop.', group: 'clinical' },
    { icon: 'check-circle-2', title: 'NABH compliance',     desc: 'Daily safety checklist, monthly audit reports, gate-entry log, bag-check workflow.', group: 'platform' },
    { icon: 'building-2',     title: 'ABDM / ABHA ready',   desc: 'Patient identity flows, consent ledger, care-context linking — built to India\'s digital health spec.', group: 'platform' },
    { icon: 'lock',           title: 'Role-based access',   desc: '12 clinical roles, fine-grained module permissions, real-time permission changes without re-login.', group: 'platform' },
    { icon: 'layout-grid',    title: 'Multi-branch',        desc: 'Run a chain from one console. Branch-scoped data, cross-branch reporting, unified billing.', group: 'admin' },
  ];

  readonly hierarchy: ShowcaseStage[] = [
    { role: 'Consultant', name: 'Dr. Sharma',   action: 'Logs round + instruction', detail: 'Step up to IV ceftriaxone Q12h. Recheck CRP at 18:00.', color: 'var(--color-primary)' },
    { role: 'RMO',        name: 'Dr. Patel',    action: 'Acknowledges + forwards',  detail: 'Will send order to nursing. ETA 14:00.',               color: 'var(--color-success)' },
    { role: 'Nursing',    name: 'Anjali',       action: 'Creates attendant task',   detail: 'Bring patient to lab for repeat CRP at 17:45.',         color: 'var(--color-warning)' },
    { role: 'Attendant',  name: 'Vikram',       action: 'Marks done + signs off',   detail: 'Done at 17:52. Patient back in bed; sample collected.', color: 'var(--color-purple)' },
  ];

  readonly modules = [
    { icon: 'stethoscope', label: 'OPD' },
    { icon: 'bed',          label: 'IPD' },
    { icon: 'file-text',    label: 'Prescriptions' },
    { icon: 'flask-conical', label: 'Labs' },
    { icon: 'pill',          label: 'Pharmacy' },
    { icon: 'receipt',       label: 'Billing' },
    { icon: 'shield-check',  label: 'Insurance' },
    { icon: 'calendar',      label: 'Appointments' },
    { icon: 'users',         label: 'Staff & RBAC' },
    { icon: 'bar-chart-2',   label: 'Reports' },
    { icon: 'bell',          label: 'Notifications' },
    { icon: 'history',       label: 'Audit log' },
    { icon: 'map-pin',       label: 'Multi-branch' },
    { icon: 'activity',      label: 'NABH' },
    { icon: 'database',      label: 'Master data' },
    { icon: 'settings',      label: 'Settings' },
  ];

  goLogin() { this.router.navigateByUrl('/login'); }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
