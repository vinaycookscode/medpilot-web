import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly activeStep = signal(0);
  private stepTimer: ReturnType<typeof setInterval> | null = null;

  readonly demoSteps = [
    {
      id: 0, icon: 'user-check', label: 'Patient Check-in',
      desc: 'Patient arrives and is registered in under 30 seconds.',
    },
    {
      id: 1, icon: 'stethoscope', label: 'Doctor Examines',
      desc: 'Doctor reviews history, records vitals and findings.',
    },
    {
      id: 2, icon: 'file-text', label: 'Prescription Written',
      desc: 'Digital Rx created with medicines, dosage and follow-up date.',
    },
    {
      id: 3, icon: 'receipt', label: 'Bill & Discharge',
      desc: 'Invoice auto-generated and patient discharged seamlessly.',
    },
  ];

  setStep(i: number) {
    this.activeStep.set(i);
    if (this.stepTimer) clearInterval(this.stepTimer);
    this.stepTimer = setInterval(() => this.activeStep.update(s => (s + 1) % 4), 3200);
  }

  ngOnInit() {
    this.stepTimer = setInterval(() => this.activeStep.update(s => (s + 1) % 4), 3200);
  }

  ngOnDestroy() {
    if (this.stepTimer) clearInterval(this.stepTimer);
  }

  readonly features = [
    {
      title: 'Smart Scheduling',
      desc: 'Book, reschedule, and manage appointments with conflict detection. No double-bookings, ever.',
      icon: 'calendar',
      color: '#38bdf8',
      bg: 'rgba(14, 165, 233, 0.15)',
    },
    {
      title: 'Patient Records',
      desc: 'Complete digital health records. Search, filter, and access full patient history in seconds.',
      icon: 'users',
      color: '#34D399',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    {
      title: 'Digital Prescriptions',
      desc: 'Write and store prescriptions with medicines, lab tests, dosage notes, and follow-up dates.',
      icon: 'file-text',
      color: '#a78bfa',
      bg: 'rgba(139, 92, 246, 0.15)',
    },
    {
      title: 'Billing & Invoicing',
      desc: 'Auto-generate invoices, track payments, and manage outstanding dues — all in one place.',
      icon: 'receipt',
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      title: 'OPD & IPD Management',
      desc: 'Token-based OPD queues, bed management, ward occupancy, and full admission workflows.',
      icon: 'bed',
      color: '#22D3EE',
      bg: 'rgba(34, 211, 238, 0.12)',
    },
    {
      title: 'Live Analytics',
      desc: 'Real-time clinic stats — appointments, revenue, top doctors, and patient trends on one dashboard.',
      icon: 'layout-dashboard',
      color: '#f87171',
      bg: 'rgba(239, 68, 68, 0.15)',
    },
  ];

  readonly steps = [
    {
      num: '01',
      title: 'Set up your clinic',
      desc: 'Create your clinic profile, add specialities, and configure services in under 3 minutes.',
    },
    {
      num: '02',
      title: 'Add your team',
      desc: 'Invite doctors and receptionists. Each role gets precisely the right access, automatically.',
    },
    {
      num: '03',
      title: 'Start managing',
      desc: 'Book appointments, create patient records, issue prescriptions, and bill — right away.',
    },
  ];
}
