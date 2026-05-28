import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gw-tab',
  standalone: true,
  imports: [CommonModule],
  template: `@if (active()) { <ng-content></ng-content> }`,
  host: {
    'class': 'gw-tab',
    '[attr.role]': "'tabpanel'",
    '[attr.hidden]': '!active() ? "" : null',
    '[attr.tabindex]': 'active() ? 0 : -1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwTabComponent {
  @Input({ required: true }) key!: string;
  @Input({ required: true }) label!: string;
  @Input() icon: string | null = null;
  @Input() badge: string | number | null = null;
  @Input() disabled = false;

  readonly active = signal(false);
}
