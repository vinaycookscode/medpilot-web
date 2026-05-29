import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type GwStatTrend = 'up' | 'down' | 'flat';

@Component({
  selector: 'gw-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'gw-stat' },
})
export class GwStatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  /** Lucide icon name shown next to the label. */
  @Input() icon: string | null = null;
  /** % change shown as a trend chip. */
  @Input() delta: number | null = null;
  /** Override trend direction; otherwise derived from `delta` sign. */
  @Input() trend: GwStatTrend | null = null;
  /** Caption shown below the trend, e.g. 'vs last week'. */
  @Input() trendLabel: string | null = null;
  /** Reverse the semantic meaning of up/down (e.g. lower error rate is good). */
  @Input() reverseGood = false;
  @Input() loading = false;

  get resolvedTrend(): GwStatTrend {
    if (this.trend) return this.trend;
    if (this.delta === null) return 'flat';
    if (this.delta > 0) return 'up';
    if (this.delta < 0) return 'down';
    return 'flat';
  }

  get isGood(): boolean {
    if (this.resolvedTrend === 'flat') return false;
    const up = this.resolvedTrend === 'up';
    return this.reverseGood ? !up : up;
  }
}
