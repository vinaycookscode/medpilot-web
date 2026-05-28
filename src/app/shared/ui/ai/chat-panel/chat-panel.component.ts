import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Layout shell for AI chat surfaces: header + scrollable message region +
 * sticky composer. Pure projection — consumer supplies content.
 */
@Component({
  selector: 'gw-chat-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="gw-cp__head"><ng-content select="[gw-chat-head]"></ng-content></header>
    <div class="gw-cp__body"><ng-content></ng-content></div>
    <footer class="gw-cp__foot"><ng-content select="[gw-chat-foot]"></ng-content></footer>
  `,
  styleUrl: './chat-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-cp-host',
    '[class.gw-cp-host--bordered]': 'bordered',
  },
})
export class GwChatPanelComponent {
  @Input() bordered = true;
}
