import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwFormActionsAlign = 'left' | 'right' | 'between';

@Component({
  selector: 'gw-form-actions',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="gw-actions__inner"><ng-content></ng-content></div>`,
  styleUrl: './form-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-actions',
    '[class.gw-actions--sticky]': 'sticky',
    '[class.gw-actions--bordered]': 'bordered',
    '[class.gw-actions--left]':    "align === 'left'",
    '[class.gw-actions--right]':   "align === 'right'",
    '[class.gw-actions--between]': "align === 'between'",
  },
})
export class GwFormActionsComponent {
  @Input() align: GwFormActionsAlign = 'right';
  /** Stick to the bottom of the surrounding scroll container. */
  @Input() sticky = false;
  /** Top border + slight background for visual separation. */
  @Input() bordered = true;
}
