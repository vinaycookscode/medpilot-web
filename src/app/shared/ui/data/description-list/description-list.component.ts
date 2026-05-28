import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GwDescriptionItem {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
}

export type GwDescriptionLayout = 'stacked' | 'inline' | 'grid';

/**
 * Two-column key / value list — for "patient details" / "settings summary" /
 * any read-only data view. Renders from a [items] array or via projected
 * <dt>/<dd> pairs.
 */
@Component({
  selector: 'gw-description-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './description-list.component.html',
  styleUrl: './description-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-dl-host',
    '[class.gw-dl-host--inline]': "layout === 'inline'",
    '[class.gw-dl-host--grid]':   "layout === 'grid'",
    '[class.gw-dl-host--bordered]': 'bordered',
  },
})
export class GwDescriptionListComponent {
  @Input() items: GwDescriptionItem[] = [];
  @Input() layout: GwDescriptionLayout = 'inline';
  @Input() bordered = false;
  /** Number of columns in 'grid' layout. */
  @Input() columns = 2;
  @Input() emptyValue = '—';
}
