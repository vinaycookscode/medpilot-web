import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwAlertVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'gw-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-alert-host',
    '[class.gw-alert-host--info]':    "variant === 'info'",
    '[class.gw-alert-host--success]': "variant === 'success'",
    '[class.gw-alert-host--warning]': "variant === 'warning'",
    '[class.gw-alert-host--danger]':  "variant === 'danger'",
    '[class.gw-alert-host--subtle]':  'subtle',
    '[attr.role]': "variant === 'danger' || variant === 'warning' ? 'alert' : 'status'",
  },
})
export class GwAlertComponent {
  @Input() variant: GwAlertVariant = 'info';
  @Input() title: string | null = null;
  @Input() dismissible = false;
  /** Subdued surface (lighter background, no border accent) — for use inside cards. */
  @Input() subtle = false;
  /** Override the default icon. Pass null to hide. */
  @Input() icon: string | null | undefined = undefined;
  @Output() dismiss = new EventEmitter<void>();

  get resolvedIcon(): string | null {
    if (this.icon === null) return null;
    if (this.icon !== undefined) return this.icon;
    switch (this.variant) {
      case 'success': return 'check-circle';
      case 'warning': return 'triangle-alert';
      case 'danger':  return 'octagon-alert';
      default:        return 'info';
    }
  }
}
