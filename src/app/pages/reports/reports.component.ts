import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { IconsModule } from '../../shared/icons';
import { ReportsService } from '../../core/services/reports.service';
import { ToastService } from '../../core/services/toast.service';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';

type ReportTab = 'revenue' | 'appointments' | 'patients' | 'inventory';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule, IconsModule, DecimalPipe, DatePipe, CurrencyPipe, GwButtonComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly activeTab = signal<ReportTab>('revenue');
  readonly revenueData = signal<any>(null);
  readonly appointmentData = signal<any>(null);
  readonly patientData = signal<any>(null);
  readonly inventoryData = signal<any>(null);
  readonly loading = signal(false);

  dateRange: FormGroup = this.fb.group({
    from: [''],
    to: [''],
  });

  get fromCtrl(): FormControl { return this.dateRange.get('from') as FormControl; }
  get toCtrl(): FormControl   { return this.dateRange.get('to') as FormControl; }

  ngOnInit() {
    this.loadReport();
  }

  onTabChange(tab: ReportTab) {
    this.activeTab.set(tab);
    this.loadReport();
  }

  loadReport() {
    const params = this.buildParams();
    this.loading.set(true);
    const tab = this.activeTab();

    const req = tab === 'revenue'
      ? this.reportsService.getRevenueSummary(params)
      : tab === 'appointments'
        ? this.reportsService.getAppointmentStats(params)
        : tab === 'patients'
          ? this.reportsService.getPatientStats(params)
          : this.reportsService.getInventoryStats(params);

    req.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (tab === 'revenue') this.revenueData.set(res.data);
        else if (tab === 'appointments') this.appointmentData.set(res.data);
        else if (tab === 'patients') this.patientData.set(res.data);
        else this.inventoryData.set(res.data);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load report', 'danger');
      },
    });
  }

  private buildParams(): Record<string, string> {
    const { from, to } = this.dateRange.value;
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return params;
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  asArray(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }
}
