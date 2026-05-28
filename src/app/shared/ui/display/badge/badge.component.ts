import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwBadgeVariant =
  | 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
export type GwBadgeTone = 'solid' | 'soft' | 'outline';
export type GwBadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'gw-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dot) { <span class="gw-badge__dot" aria-hidden="true"></span> }
    <ng-content></ng-content>
  `,
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-badge',
    '[class.gw-badge--solid]':   "tone === 'solid'",
    '[class.gw-badge--soft]':    "tone === 'soft'",
    '[class.gw-badge--outline]': "tone === 'outline'",
    '[class.gw-badge--sm]': "size === 'sm'",
    '[class.gw-badge--lg]': "size === 'lg'",
    '[class.gw-badge--has-dot]': 'dot',
    '[attr.data-variant]': 'variant',
  },
})
export class GwBadgeComponent {
  @Input() variant: GwBadgeVariant = 'neutral';
  @Input() tone: GwBadgeTone = 'soft';
  @Input() size: GwBadgeSize = 'md';
  /** Leading status dot. */
  @Input() dot = false;
}
