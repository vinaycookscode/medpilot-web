import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface GwBreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
  /** When true, renders as plain text (the current page). Last item is automatically current if `current` not set. */
  current?: boolean;
}

export type GwBreadcrumbSeparator = 'chevron' | 'slash' | 'arrow';

@Component({
  selector: 'gw-breadcrumbs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'gw-bc-host' },
})
export class GwBreadcrumbsComponent {
  @Input({ required: true }) items: GwBreadcrumbItem[] = [];
  @Input() separator: GwBreadcrumbSeparator = 'chevron';
  /** Show only first + last + (…) when items.length exceeds this. 0 to disable. */
  @Input() collapseAfter = 0;
  @Output() itemClick = new EventEmitter<GwBreadcrumbItem>();

  isCurrent(item: GwBreadcrumbItem, index: number): boolean {
    if (item.current !== undefined) return item.current;
    return index === this.items.length - 1;
  }

  get displayed(): Array<GwBreadcrumbItem | { ellipsis: true }> {
    const n = this.items.length;
    if (!this.collapseAfter || n <= this.collapseAfter) return this.items;
    return [
      this.items[0],
      { ellipsis: true } as any,
      this.items[n - 2],
      this.items[n - 1],
    ];
  }

  handleClick(item: GwBreadcrumbItem, event: Event) {
    if (this.itemClick.observed) {
      event.preventDefault();
      this.itemClick.emit(item);
    }
  }

  asEllipsis(item: GwBreadcrumbItem | { ellipsis: true }): item is { ellipsis: true } {
    return (item as any).ellipsis === true;
  }

  isItemCurrent(item: GwBreadcrumbItem | { ellipsis: true }, index: number): boolean {
    if (this.asEllipsis(item)) return false;
    return this.isCurrent(item, index);
  }
}
