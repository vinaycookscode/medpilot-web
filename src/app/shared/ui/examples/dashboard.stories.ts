import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { GwSidebarComponent, GwSidebarSection } from '../navigation/sidebar/sidebar.component';
import { GwTopNavComponent } from '../navigation/top-nav/top-nav.component';
import { GwKpiGridComponent } from '../enterprise/kpi-grid/kpi-grid.component';
import { GwTableComponent, GwTableColumn } from '../data/table/table.component';
import { GwCellDirective } from '../data/table/cell.directive';
import { GwBadgeComponent } from '../display/badge/badge.component';
import { GwAvatarComponent } from '../display/avatar/avatar.component';
import { GwIconButtonComponent } from '../buttons/icon-button/icon-button.component';
import { GwButtonComponent } from '../buttons/button/button.component';
import { GwActivityFeedComponent, GwActivityItem } from '../data/activity-feed/activity-feed.component';
import { GwCardComponent } from '../display/card/card.component';
import { GwSearchInputComponent } from '../forms/search-input/search-input.component';
import { GwTabsComponent } from '../navigation/tabs/tabs.component';
import { GwTabComponent } from '../navigation/tabs/tab.component';
import { GwBreadcrumbsComponent } from '../navigation/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'demo-dashboard',
  standalone: true,
  imports: [
    GwSidebarComponent, GwTopNavComponent, GwKpiGridComponent,
    GwTableComponent, GwCellDirective, GwBadgeComponent, GwAvatarComponent,
    GwIconButtonComponent, GwButtonComponent, GwActivityFeedComponent,
    GwCardComponent, GwSearchInputComponent,
    GwTabsComponent, GwTabComponent, GwBreadcrumbsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash">
      <gw-sidebar [sections]="sections" activeKey="admissions">
        <div gw-sidebar-brand class="dash__brand">
          <div class="dash__brand-glyph"></div>
          <span>GotWell</span>
        </div>
        <div gw-sidebar-footer class="dash__sb-footer">
          <gw-avatar name="Anjali Sharma" size="sm" status="online" />
          <div>
            <p>Anjali Sharma</p>
            <span>RMO · Ward 2</span>
          </div>
        </div>
      </gw-sidebar>

      <main class="dash__main">
        <gw-top-nav [sticky]="true">
          <div gw-top-nav-brand>
            <gw-breadcrumbs [items]="crumbs" />
          </div>
          <div gw-top-nav-center style="width: 320px;">
            <gw-search-input placeholder="Search patients, MRN, doctors…" />
          </div>
          <div gw-top-nav-right>
            <gw-icon-button icon="bell" ariaLabel="Notifications" />
            <gw-icon-button icon="settings" ariaLabel="Settings" />
            <gw-avatar name="Anjali Sharma" size="sm" status="online" />
          </div>
        </gw-top-nav>

        <div class="dash__page">
          <header class="dash__head">
            <div>
              <h1>Good morning, Anjali</h1>
              <p>Here's what's happening in your hospital today.</p>
            </div>
            <div class="dash__head-actions">
              <gw-button variant="secondary">Export report</gw-button>
              <gw-button variant="primary" leadingIcon="plus">Admit patient</gw-button>
            </div>
          </header>

          <gw-kpi-grid [items]="kpis" />

          <gw-card style="margin-top: 16px;">
            <div gw-card-header style="display:flex; align-items:center; justify-content:space-between;">
              <div>
                <h2 style="margin:0; font-size:14px; font-weight:600;">Today's admissions</h2>
                <p style="margin:2px 0 0; font-size:12px; color:var(--text-secondary);">Live · {{ patients.length }} patients</p>
              </div>
              <gw-tabs activeKey="all" variant="segmented" size="sm">
                <gw-tab key="all"        label="All" [badge]="patients.length" />
                <gw-tab key="critical"   label="Critical" />
                <gw-tab key="stable"     label="Stable" />
                <gw-tab key="discharged" label="Discharged" />
              </gw-tabs>
            </div>

            <gw-table [data]="patients" [columns]="cols" density="comfortable" trackBy="id">
              <ng-template gwCell="name" let-row>
                <div style="display:flex; align-items:center; gap:8px;">
                  <gw-avatar [name]="row.name" size="sm" />
                  <div style="display:flex; flex-direction:column; min-width:0;">
                    <span style="font-weight:500;">{{ row.name }}</span>
                    <span style="font-size:11px; color:var(--text-tertiary);">{{ row.mrn }}</span>
                  </div>
                </div>
              </ng-template>
              <ng-template gwCell="status" let-row>
                <gw-badge [variant]="row.status === 'critical' ? 'danger' : row.status === 'stable' ? 'success' : 'warning'" tone="soft" [dot]="true">
                  {{ row.status }}
                </gw-badge>
              </ng-template>
              <ng-template gwCell="__actions" let-row>
                <div style="display:flex; gap:2px; justify-content:flex-end;">
                  <gw-icon-button size="sm" icon="eye" ariaLabel="View" />
                  <gw-icon-button size="sm" icon="more-vertical" ariaLabel="More" />
                </div>
              </ng-template>
            </gw-table>
          </gw-card>

          <div class="dash__split">
            <gw-card>
              <div gw-card-header>
                <h2 style="margin:0; font-size:14px; font-weight:600;">Recent activity</h2>
              </div>
              <gw-activity-feed [items]="activity" />
            </gw-card>

            <gw-card>
              <div gw-card-header>
                <h2 style="margin:0; font-size:14px; font-weight:600;">Bed occupancy</h2>
              </div>
              <div style="padding: 8px 4px;">
                @for (b of beds; track b.ward) {
                  <div style="display:flex; align-items:center; gap:12px; padding: 8px 0;">
                    <span style="flex:1; font-size:13px; color:var(--text-primary); font-weight:500;">{{ b.ward }}</span>
                    <span style="font-size:12px; color:var(--text-secondary); font-variant-numeric:tabular-nums;">{{ b.used }} / {{ b.total }}</span>
                    <div style="flex: 0 0 120px; height: 6px; background: var(--surface-input); border-radius: 999px; overflow: hidden;">
                      <div [style.width.%]="(b.used / b.total) * 100" [style.background]="b.used / b.total > 0.85 ? 'var(--color-danger)' : 'var(--color-primary)'" style="height:100%;"></div>
                    </div>
                  </div>
                }
              </div>
            </gw-card>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dash { display: grid; grid-template-columns: 248px 1fr; min-height: 100vh; background: var(--surface-page); font-family: var(--font-family); }
    .dash__main { display: flex; flex-direction: column; min-height: 0; }
    .dash__page { padding: 28px 32px; flex: 1; min-width: 0; }
    .dash__brand { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; color: var(--text-primary); padding: 6px 10px; }
    .dash__brand-glyph { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #2563EB, #1E3A8A); }
    .dash__sb-footer { display: flex; align-items: center; gap: 10px; padding: 8px; }
    .dash__sb-footer p { margin: 0; font-size: 12px; font-weight: 500; color: var(--text-primary); line-height: 1.2; }
    .dash__sb-footer span { font-size: 11px; color: var(--text-secondary); }

    .dash__head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .dash__head h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
    .dash__head p { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
    .dash__head-actions { display: flex; gap: 8px; }

    .dash__split { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-top: 16px; }
  `],
})
class DemoDashboardComponent {
  sections: GwSidebarSection[] = [
    { label: 'Workspace', items: [
      { key: 'home',        label: 'Dashboard',  icon: 'layout-dashboard' },
      { key: 'admissions',  label: 'Admissions', icon: 'bed', badge: 42 },
      { key: 'opd',         label: 'OPD',        icon: 'stethoscope', badge: 186 },
      { key: 'lab',         label: 'Lab',        icon: 'flask-conical' },
      { key: 'pharmacy',    label: 'Pharmacy',   icon: 'pill' },
    ]},
    { label: 'Manage', items: [
      { key: 'staff',       label: 'Staff',      icon: 'users' },
      { key: 'rotation',    label: 'Rotation',   icon: 'calendar' },
      { key: 'billing',     label: 'Billing',    icon: 'wallet' },
      { key: 'reports',     label: 'Reports',    icon: 'bar-chart-2' },
    ]},
    { label: 'Admin', items: [
      { key: 'permissions', label: 'Permissions', icon: 'shield' },
      { key: 'audit',       label: 'Audit log',   icon: 'history' },
      { key: 'settings',    label: 'Settings',    icon: 'settings' },
    ]},
  ];

  crumbs = [
    { label: 'Workspace', link: '/' },
    { label: 'Admissions' },
  ];

  kpis = [
    { label: 'Admissions today',   value: 42, delta: 12, trendLabel: 'vs yesterday', icon: 'bed' },
    { label: 'OPD visits',         value: 186, delta: -4, trendLabel: 'vs yesterday', icon: 'stethoscope' },
    { label: 'ICU beds free',      value: 3,  delta: 0,  trendLabel: 'capacity stable', icon: 'activity' },
    { label: 'Avg. wait time',     value: '14m', delta: -22, reverseGood: true, trendLabel: 'vs last week', icon: 'timer' },
  ];

  cols: GwTableColumn[] = [
    { key: 'name',     label: 'Patient' },
    { key: 'age',      label: 'Age', sortable: true, align: 'right', width: '70px' },
    { key: 'ward',     label: 'Ward' },
    { key: 'status',   label: 'Status' },
    { key: 'consultant', label: 'Consultant' },
    { key: 'admitted', label: 'Admitted', align: 'right' },
    { key: '__actions', label: '', width: '88px', align: 'right' },
  ];

  patients = [
    { id: 1, mrn: 'MR-1001', name: 'Riya Verma',    age: 34, ward: 'ICU-3',   status: 'critical', consultant: 'Dr. Sharma', admitted: '08:14 AM' },
    { id: 2, mrn: 'MR-1002', name: 'Karan Mehta',   age: 56, ward: 'Gen-12',  status: 'stable',   consultant: 'Dr. Iyer',   admitted: '07:42 AM' },
    { id: 3, mrn: 'MR-1003', name: 'Anjali Singh',  age: 22, ward: 'Mat-4',   status: 'stable',   consultant: 'Dr. Rao',    admitted: '06:55 AM' },
    { id: 4, mrn: 'MR-1004', name: 'Vivaan Kapoor', age: 48, ward: 'ICU-1',   status: 'observation', consultant: 'Dr. Sharma', admitted: '09:08 AM' },
    { id: 5, mrn: 'MR-1005', name: 'Asha Pillai',   age: 71, ward: 'Gen-08',  status: 'stable',   consultant: 'Dr. Iyer',   admitted: 'Yesterday' },
  ];

  activity: GwActivityItem[] = [
    { id: 1, actor: 'Dr. Sharma', action: 'discharged', target: 'Riya Verma',    time: '5m' },
    { id: 2, actor: 'Anjali Nurse', action: 'recorded vitals for', target: 'Karan Mehta', time: '12m', detail: 'BP 138/92, HR 84' },
    { id: 3, actor: 'Lab',         action: 'flagged critical result for', target: 'Vivaan Kapoor', time: '20m', detail: 'Troponin-I elevated' },
    { id: 4, actor: 'Dr. Iyer',    action: 'admitted',  target: 'Asha Pillai',    time: '1h' },
    { id: 5, actor: 'Pharmacy',    action: 'dispensed Cef + Pan for', target: 'ICU-3', time: '1h' },
  ];

  beds = [
    { ward: 'ICU',         used: 8,  total: 12 },
    { ward: 'General',     used: 36, total: 60 },
    { ward: 'Maternity',   used: 12, total: 18 },
    { ward: 'Private',     used: 22, total: 24 },
    { ward: 'Emergency',   used: 4,  total: 6  },
  ];
}

const meta: Meta = {
  title: 'Examples/Dashboard',
  component: DemoDashboardComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [DemoDashboardComponent] })],
};
export default meta;
type Story = StoryObj<DemoDashboardComponent>;

export const Default: Story = { render: () => ({ template: `<demo-dashboard />` }) };
