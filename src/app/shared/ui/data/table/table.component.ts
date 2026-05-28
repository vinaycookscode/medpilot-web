import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwCellDirective } from './cell.directive';

export type GwTableAlign = 'left' | 'right' | 'center';
export type GwTableDensity = 'compact' | 'comfortable' | 'spacious';

export interface GwTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: GwTableAlign;
  /** Any valid CSS width — `'120px'`, `'20%'`, `'auto'`, `'minmax(120px, 1fr)'`. */
  width?: string;
  truncate?: boolean;
  cellClass?: string;
  headerClass?: string;
}

export interface GwTableSort {
  key: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'gw-table',
  standalone: true,
  imports: [CommonModule, GwCellDirective],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-table-host',
    '[class.gw-table-host--compact]':    "density === 'compact'",
    '[class.gw-table-host--spacious]':   "density === 'spacious'",
    '[class.gw-table-host--bordered]':   'bordered',
    '[class.gw-table-host--hoverable]':  'hoverable',
    '[class.gw-table-host--sticky-head]': 'stickyHeader',
    '[class.gw-table-host--loading]':    'loading',
  },
})
export class GwTableComponent<T = any> {
  @Input({ required: true }) columns: GwTableColumn[] = [];
  @Input({ required: true }) data: T[] = [];
  @Input() loading = false;
  /** Skeleton row count while loading. */
  @Input() skeletonRows = 5;
  @Input() density: GwTableDensity = 'comfortable';
  @Input() bordered = true;
  @Input() hoverable = true;
  @Input() stickyHeader = false;
  /** Field on the row to use as a unique id. */
  @Input() trackBy: string | null = null;
  @Input() emptyText = 'No results';
  /** Current sort state. Sorting is consumer-controlled. */
  @Input() set sort(value: GwTableSort | null) { this.sortState.set(value); }
  /** Emits when a sortable header is clicked. Parent sorts and feeds back via `data`. */
  @Output() sortChange = new EventEmitter<GwTableSort | null>();
  /** Emits when a row is clicked. */
  @Output() rowClick = new EventEmitter<T>();

  @ContentChildren(GwCellDirective) cellTemplates?: QueryList<GwCellDirective>;

  readonly sortState = signal<GwTableSort | null>(null);

  cellTemplate(key: string): TemplateRef<any> | null {
    if (!this.cellTemplates) return null;
    return this.cellTemplates.find(t => t.key === key)?.template ?? null;
  }

  trackRow = (index: number, row: T): unknown => {
    if (this.trackBy && row && typeof row === 'object') return (row as any)[this.trackBy];
    return index;
  };

  onHeaderClick(col: GwTableColumn) {
    if (!col.sortable) return;
    const current = this.sortState();
    let next: GwTableSort | null;
    if (!current || current.key !== col.key)      next = { key: col.key, direction: 'asc' };
    else if (current.direction === 'asc')         next = { key: col.key, direction: 'desc' };
    else                                          next = null;
    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  sortIndicator(col: GwTableColumn): 'asc' | 'desc' | null {
    if (!col.sortable) return null;
    const s = this.sortState();
    return s && s.key === col.key ? s.direction : null;
  }

  get skeletonRowsArray(): number[] {
    return Array.from({ length: this.skeletonRows }, (_, i) => i);
  }

  cellValue(row: T, key: string): unknown {
    if (!row || typeof row !== 'object') return '';
    return (row as any)[key];
  }
}
