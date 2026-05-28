import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwMessageRole = 'user' | 'assistant' | 'system';

@Component({
  selector: 'gw-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-msg',
    '[attr.data-role]': 'role',
    '[class.gw-msg--streaming]': 'streaming',
  },
})
export class GwMessageBubbleComponent {
  @Input() role: GwMessageRole = 'assistant';
  @Input() author: string | null = null;
  @Input() time: string | null = null;
  /** Show typing/streaming indicator instead of content. */
  @Input() streaming = false;
}
