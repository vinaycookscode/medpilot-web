import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly features = [
    {
      title: 'Smart Scheduling',
      desc: 'Book, reschedule, and manage appointments with conflict detection. No double-bookings, ever.',
      icon: 'calendar',
      color: '#007AFF',
      bg: 'rgba(0, 122, 255, 0.10)',
    },
    {
      title: 'Patient Records',
      desc: 'Complete digital health records. Search, filter, and access full patient history in seconds.',
      icon: 'users',
      color: '#34C759',
      bg: 'rgba(52, 199, 89, 0.10)',
    },
    {
      title: 'Digital Prescriptions',
      desc: 'Write and store prescriptions with medicines, lab tests, dosage notes, and follow-up dates.',
      icon: 'file-text',
      color: '#AF52DE',
      bg: 'rgba(175, 82, 222, 0.10)',
    },
    {
      title: 'Billing & Invoicing',
      desc: 'Auto-generate invoices, track payments, and manage outstanding dues — all in one place.',
      icon: 'receipt',
      color: '#FF9F0A',
      bg: 'rgba(255, 159, 10, 0.10)',
    },
    {
      title: 'Follow-up Tracker',
      desc: 'See overdue, today, and upcoming patient follow-ups at a glance. Never let a patient fall through.',
      icon: 'calendar-check',
      color: '#5AC8FA',
      bg: 'rgba(90, 200, 250, 0.10)',
    },
    {
      title: 'Live Analytics',
      desc: 'Real-time clinic stats — appointments, revenue, top doctors, and patient trends on one dashboard.',
      icon: 'layout-dashboard',
      color: '#FF3B30',
      bg: 'rgba(255, 59, 48, 0.10)',
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
