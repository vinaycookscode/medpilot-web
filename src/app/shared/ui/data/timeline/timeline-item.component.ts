import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type GwTimelineItemTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'gw-timeline-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-tl-item',
    '[attr.data-tone]': 'tone',
  },
})
export class GwTimelineItemComponent {
  @Input() title = '';
  @Input() time: string | null = null;
  @Input() icon: string | null = null;
  @Input() tone: GwTimelineItemTone = 'neutral';
}
