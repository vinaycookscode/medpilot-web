import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type GwButtonSize = 'sm' | 'md' | 'lg';
export type GwButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'gw-button, button[gw-button], a[gw-button]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-button-host',
    '[class.gw-button-host--primary]':   "variant === 'primary'",
    '[class.gw-button-host--secondary]': "variant === 'secondary'",
    '[class.gw-button-host--ghost]':     "variant === 'ghost'",
    '[class.gw-button-host--danger]':    "variant === 'danger'",
    '[class.gw-button-host--subtle]':    "variant === 'subtle'",
    '[class.gw-button-host--sm]': "size === 'sm'",
    '[class.gw-button-host--lg]': "size === 'lg'",
    '[class.gw-button-host--block]': 'block',
    '[class.gw-button-host--loading]': 'loading',
    '[attr.disabled]': '(disabled || loading) ? true : null',
    '[attr.aria-busy]': 'loading || null',
  },
})
export class GwButtonComponent {
  @Input() variant: GwButtonVariant = 'primary';
  @Input() size: GwButtonSize = 'md';
  @Input() type: GwButtonType = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  @Input() leadingIcon: string | null = null;
  @Input() trailingIcon: string | null = null;
}
