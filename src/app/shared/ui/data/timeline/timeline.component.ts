import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gw-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `<ol class="gw-tl"><ng-content></ng-content></ol>`,
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-timeline-host',
    '[class.gw-timeline-host--compact]': "density === 'compact'",
  },
})
export class GwTimelineComponent {
  @Input() density: 'compact' | 'comfortable' = 'comfortable';
}
