import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwStatCardComponent } from '../../data/stat-card/stat-card.component';

export interface GwKpi {
  label: string;
  value: string | number;
  icon?: string;
  delta?: number;
  trendLabel?: string;
  reverseGood?: boolean;
}

/**
 * Convenience grid of gw-stat-card. Responsive: auto-fits as many KPIs per
 * row as fit at the given minimum card width.
 */
@Component({
  selector: 'gw-kpi-grid',
  standalone: true,
  imports: [CommonModule, GwStatCardComponent],
  template: `
    <div class="gw-kpig"
         [style.grid-template-columns]="'repeat(auto-fit, minmax(' + minWidth + 'px, 1fr))'">
      @for (k of items; track k.label) {
        <gw-stat-card
          [label]="k.label"
          [value]="k.value"
          [icon]="k.icon ?? null"
          [delta]="k.delta ?? null"
          [trendLabel]="k.trendLabel ?? null"
          [reverseGood]="k.reverseGood ?? false"
        ></gw-stat-card>
      }
    </div>
  `,
  styles: [`:host { display: block; } .gw-kpig { display: grid; gap: 12px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwKpiGridComponent {
  @Input({ required: true }) items: GwKpi[] = [];
  @Input() minWidth = 220;
}
