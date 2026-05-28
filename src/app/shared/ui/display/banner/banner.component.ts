import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwBannerVariant = 'info' | 'success' | 'warning' | 'danger' | 'announce';

/**
 * Full-width announcement bar — sits at the top of a page or section.
 * For inline messages within content, use [[alert.component | gw-alert]] instead.
 */
@Component({
  selector: 'gw-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-banner',
    '[attr.data-variant]': 'variant',
    '[attr.role]': "variant === 'danger' || variant === 'warning' ? 'alert' : 'status'",
  },
})
export class GwBannerComponent {
  @Input() variant: GwBannerVariant = 'announce';
  @Input() icon: string | null | undefined = undefined;
  @Input() dismissible = false;
  @Output() dismiss = new EventEmitter<void>();

  get resolvedIcon(): string | null {
    if (this.icon === null) return null;
    if (this.icon !== undefined) return this.icon;
    switch (this.variant) {
      case 'success':  return 'check-circle';
      case 'warning':  return 'triangle-alert';
      case 'danger':   return 'octagon-alert';
      case 'info':     return 'info';
      default:         return 'megaphone';
    }
  }
}
