import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwEmptyStateSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'gw-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-empty',
    '[class.gw-empty--sm]': "size === 'sm'",
    '[class.gw-empty--lg]': "size === 'lg'",
  },
})
export class GwEmptyStateComponent {
  /** Lucide icon name. Pass null to omit. */
  @Input() icon: string | null = 'inbox';
  @Input() title = '';
  @Input() description: string | null = null;
  @Input() size: GwEmptyStateSize = 'md';
}
