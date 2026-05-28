import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwSpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'gw-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="gw-spin__dot" aria-hidden="true"></span>`,
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-spin',
    '[class.gw-spin--xs]': "size === 'xs'",
    '[class.gw-spin--sm]': "size === 'sm'",
    '[class.gw-spin--lg]': "size === 'lg'",
    '[attr.role]': "'status'",
    '[attr.aria-label]': 'ariaLabel',
  },
})
export class GwSpinnerComponent {
  @Input() size: GwSpinnerSize = 'md';
  @Input() ariaLabel = 'Loading…';
}
