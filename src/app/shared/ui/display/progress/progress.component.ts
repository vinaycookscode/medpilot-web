import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwProgressVariant = 'primary' | 'success' | 'warning' | 'danger';
export type GwProgressMode = 'linear' | 'circular';

@Component({
  selector: 'gw-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-prog',
    '[class.gw-prog--circular]': "mode === 'circular'",
    '[attr.role]': "'progressbar'",
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'max',
    '[attr.aria-valuenow]': 'value ?? null',
    '[attr.aria-busy]': 'indeterminate || null',
  },
})
export class GwProgressComponent {
  @Input() mode: GwProgressMode = 'linear';
  /** 0..max. Set to null to render an indeterminate bar/ring. */
  @Input() value: number | null = 0;
  @Input() max = 100;
  @Input() variant: GwProgressVariant = 'primary';
  /** Show numeric percentage below the bar or inside the ring. */
  @Input() showLabel = false;
  /** Diameter in px (circular only). */
  @Input() size = 56;
  /** Stroke width in px (circular only). */
  @Input() stroke = 4;

  get indeterminate(): boolean { return this.value === null; }

  get pct(): number {
    if (this.value === null) return 0;
    return Math.max(0, Math.min(100, (this.value / this.max) * 100));
  }

  // Circular math
  get radius(): number { return (this.size - this.stroke) / 2; }
  get circumference(): number { return 2 * Math.PI * this.radius; }
  get dashOffset(): number { return this.circumference * (1 - this.pct / 100); }
}
