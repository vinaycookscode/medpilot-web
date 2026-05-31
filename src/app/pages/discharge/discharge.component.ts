import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { AuthService } from '../../core/services/auth.service';
import {
  DischargeService, DischargeProcess, DischargeStage, DISCHARGE_STAGE_LABELS,
} from '../../core/services/discharge.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../shared/ui/display/badge/badge.component';
import { GwTableComponent, GwTableColumn } from '../../shared/ui/data/table/table.component';
import { GwCellDirective } from '../../shared/ui/data/table/cell.directive';
import { GwSegmentedComponent, GwSegmentOption } from '../../shared/ui/forms/segmented/segmented.component';
import { PatientLinkComponent } from '../../shared/patient-link/patient-link.component';

type Scope = 'mine' | 'all';

@Component({
  selector: 'app-discharge',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IconsModule,
    GwButtonComponent, GwBadgeComponent, GwTableComponent, GwCellDirective, GwSegmentedComponent,
    PatientLinkComponent,
  ],
  templateUrl: './discharge.component.html',
  styleUrl: './discharge.component.scss',
})
export class DischargeComponent implements OnInit {
  private svc = inject(DischargeService);
  private router = inject(Router);
  readonly auth = inject(AuthService);

  readonly rows = signal<DischargeProcess[]>([]);
  readonly loading = signal(true);
  readonly scope = signal<Scope>('mine');
  stageLabel(s: string): string { return DISCHARGE_STAGE_LABELS[s as DischargeStage] ?? s; }

  readonly scopeOptions: GwSegmentOption[] = [
    { value: 'mine', label: 'My Worklist' },
    { value: 'all', label: 'All Discharges' },
  ];

  readonly columns: GwTableColumn[] = [
    { key: 'patient', label: 'Patient' },
    { key: 'admission', label: 'Admission', width: '150px' },
    { key: 'stage', label: 'Stage', width: '150px' },
    { key: 'initiatedBy', label: 'Initiated by', width: '160px' },
    { key: 'waiting', label: 'Since', width: '100px' },
    { key: 'action', label: '', width: '90px', align: 'right' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const src$ = this.scope() === 'mine' ? this.svc.myWorklist() : this.svc.list({ activeOnly: 'true' });
    src$.subscribe({
      next: (r) => { this.rows.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setScope(s: Scope) { this.scope.set(s); this.load(); }
  open(p: DischargeProcess) { this.router.navigate(['/discharge', p.id]); }

  stageVariant(stage: DischargeStage): GwBadgeVariant {
    const m: Record<string, GwBadgeVariant> = {
      rmo_card: 'primary', billing: 'warning', completed: 'success', cancelled: 'danger',
    };
    return m[stage] ?? 'neutral';
  }

  waitingSince(iso: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
  }
}
