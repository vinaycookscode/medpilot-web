import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gw-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-pg-host',
    '[class.gw-pg-host--compact]': "size === 'compact'",
  },
})
export class GwPaginationComponent {
  @Input({ required: true }) total = 0;
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() pageSizes: number[] = [10, 20, 50, 100];
  @Input() showPageSize = true;
  @Input() showTotal = true;
  @Input() size: 'comfortable' | 'compact' = 'comfortable';
  /** Number of sibling pages to show around the current page. */
  @Input() siblings = 1;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get fromRow(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }
  get toRow(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  /** Sequence of page numbers + '…' tokens to render. */
  get pages(): Array<number | '…'> {
    const total = this.totalPages;
    const current = this.page;
    const sibs = this.siblings;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const out: Array<number | '…'> = [];
    const left = Math.max(2, current - sibs);
    const right = Math.min(total - 1, current + sibs);

    out.push(1);
    if (left > 2) out.push('…');
    for (let i = left; i <= right; i++) out.push(i);
    if (right < total - 1) out.push('…');
    out.push(total);
    return out;
  }

  go(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }

  changeSize(event: Event) {
    const v = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(v);
  }

  asNumber(p: number | '…'): number | null { return typeof p === 'number' ? p : null; }
}
