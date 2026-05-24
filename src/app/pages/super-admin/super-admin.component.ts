import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { ChargeMasterComponent } from './charge-master/charge-master.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { NabhComponent } from './nabh/nabh.component';
import { MasterDataComponent } from './master-data/master-data.component';
import { CommonModule } from '@angular/common';

type Tab = 'master-data' | 'charge-master' | 'permissions' | 'nabh';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, IconsModule, ChargeMasterComponent, PermissionsComponent, NabhComponent, MasterDataComponent],
  templateUrl: './super-admin.component.html',
  styleUrl: './super-admin.component.scss',
})
export class SuperAdminComponent {
  readonly activeTab = signal<Tab>('master-data');

  readonly tabs: Array<{ id: Tab; label: string; icon: string; desc: string }> = [
    { id: 'master-data',   label: 'Master Data', icon: 'database', desc: 'Configure all HMS lookup data used across the system' },
    { id: 'charge-master', label: 'Charge Master', icon: 'indian-rupee', desc: 'Manage all charge types, departments & pricing' },
    { id: 'permissions',   label: 'Roles & Permissions', icon: 'shield-check', desc: 'Configure role-based access for all staff' },
    { id: 'nabh',          label: 'NABH Compliance', icon: 'clipboard-check', desc: 'Daily checklists and accreditation monitoring' },
  ];

  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}
