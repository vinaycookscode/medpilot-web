import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gw-top-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gw-tn__left"><ng-content select="[gw-top-nav-brand]"></ng-content></div>
    <div class="gw-tn__center"><ng-content select="[gw-top-nav-center]"></ng-content></div>
    <div class="gw-tn__right"><ng-content select="[gw-top-nav-right]"></ng-content></div>
  `,
  styleUrl: './top-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-tn-host',
    '[class.gw-tn-host--bordered]': 'bordered',
    '[class.gw-tn-host--sticky]':   'sticky',
  },
})
export class GwTopNavComponent {
  @Input() bordered = true;
  @Input() sticky = false;
}
