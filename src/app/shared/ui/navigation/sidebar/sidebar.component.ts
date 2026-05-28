import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GwSidebarItem {
  key: string;
  label: string;
  icon?: string;
  link?: string;
  badge?: string | number;
  disabled?: boolean;
  children?: GwSidebarItem[];
}

export interface GwSidebarSection {
  label?: string;
  items: GwSidebarItem[];
}

@Component({
  selector: 'gw-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-sb-host',
    '[class.gw-sb-host--collapsed]': 'collapsed',
  },
})
export class GwSidebarComponent {
  @Input({ required: true }) sections: GwSidebarSection[] = [];
  @Input() activeKey: string | null = null;
  @Input() collapsed = false;

  isActive(item: GwSidebarItem): boolean { return item.key === this.activeKey; }
}
