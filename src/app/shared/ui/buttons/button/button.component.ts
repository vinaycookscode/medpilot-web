import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type GwButtonSize = 'sm' | 'md' | 'lg';
export type GwButtonType = 'button' | 'submit' | 'reset';

/**
 * Renders an inner real <button> so it works as a native form submit
 * button (and is keyboard-/screen-reader-accessible by default). The
 * <gw-button> host element is laid out as `display: contents` so it
 * disappears from the layout tree and the inner <button> takes over.
 */
@Component({
  selector: 'gw-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'gw-button-host' },
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
