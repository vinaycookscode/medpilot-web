import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type GwIconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type GwIconButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'gw-icon-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-icon-button-host',
    '[class.gw-icon-button-host--primary]':   "variant === 'primary'",
    '[class.gw-icon-button-host--secondary]': "variant === 'secondary'",
    '[class.gw-icon-button-host--ghost]':     "variant === 'ghost'",
    '[class.gw-icon-button-host--danger]':    "variant === 'danger'",
    '[class.gw-icon-button-host--subtle]':    "variant === 'subtle'",
    '[class.gw-icon-button-host--sm]': "size === 'sm'",
    '[class.gw-icon-button-host--lg]': "size === 'lg'",
  },
})
export class GwIconButtonComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) ariaLabel!: string;
  @Input() variant: GwIconButtonVariant = 'ghost';
  @Input() size: GwIconButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  get iconSize(): number {
    return this.size === 'sm' ? 14 : this.size === 'lg' ? 20 : 18;
  }
}
