import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwSkeletonShape = 'rect' | 'text' | 'circle' | 'avatar';

@Component({
  selector: 'gw-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: '',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-skel',
    '[class.gw-skel--text]':   "shape === 'text'",
    '[class.gw-skel--circle]': "shape === 'circle'",
    '[class.gw-skel--avatar]': "shape === 'avatar'",
    '[style.width]':  'cssWidth',
    '[style.height]': 'cssHeight',
    '[style.--gw-skel-lines]': 'lines',
    '[attr.aria-busy]': 'true',
    '[attr.aria-label]': 'ariaLabel',
  },
})
export class GwSkeletonComponent {
  @Input() shape: GwSkeletonShape = 'rect';
  @Input() width: string | number | null = null;
  @Input() height: string | number | null = null;
  /** For shape='text', number of stacked lines. */
  @Input() lines = 1;
  @Input() ariaLabel = 'Loading…';

  get cssWidth():  string | null { return this.width  == null ? null : typeof this.width  === 'number' ? `${this.width}px`  : this.width; }
  get cssHeight(): string | null { return this.height == null ? null : typeof this.height === 'number' ? `${this.height}px` : this.height; }
}
