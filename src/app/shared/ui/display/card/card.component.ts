import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwCardElevation = 'flat' | 'sm' | 'md' | 'lg';
export type GwCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Surface primitive. Provides border/shadow/radius; consumer projects content
 * with optional [gw-card-header] / [gw-card-footer] slots.
 *
 *   <gw-card elevation="sm" padding="md">
 *     <div gw-card-header>Title</div>
 *     <p>Body content…</p>
 *     <div gw-card-footer>Footer</div>
 *   </gw-card>
 */
@Component({
  selector: 'gw-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gw-card__header"><ng-content select="[gw-card-header]"></ng-content></div>
    <div class="gw-card__body"><ng-content></ng-content></div>
    <div class="gw-card__footer"><ng-content select="[gw-card-footer]"></ng-content></div>
  `,
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-card',
    '[class.gw-card--flat]':  "elevation === 'flat'",
    '[class.gw-card--sm]':    "elevation === 'sm'",
    '[class.gw-card--md]':    "elevation === 'md'",
    '[class.gw-card--lg]':    "elevation === 'lg'",
    '[class.gw-card--p-none]': "padding === 'none'",
    '[class.gw-card--p-sm]':   "padding === 'sm'",
    '[class.gw-card--p-md]':   "padding === 'md'",
    '[class.gw-card--p-lg]':   "padding === 'lg'",
    '[class.gw-card--hoverable]': 'hoverable',
    '[class.gw-card--interactive]': 'interactive',
    '[attr.role]': "interactive ? 'button' : null",
    '[attr.tabindex]': "interactive ? 0 : null",
  },
})
export class GwCardComponent {
  @Input() elevation: GwCardElevation = 'sm';
  @Input() padding: GwCardPadding = 'md';
  /** Subtle lift on hover. */
  @Input() hoverable = false;
  /** Treat the whole card as clickable (focusable, role=button). */
  @Input() interactive = false;
}
