import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwTagVariant =
  | 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
export type GwTagSize = 'sm' | 'md';

@Component({
  selector: 'gw-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
    @if (removable) {
      <button type="button" class="gw-tag__x" aria-label="Remove" (click)="remove.emit()">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>
    }
  `,
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-tag',
    '[class.gw-tag--sm]': "size === 'sm'",
    '[attr.data-variant]': 'variant',
  },
})
export class GwTagComponent {
  @Input() variant: GwTagVariant = 'neutral';
  @Input() size: GwTagSize = 'md';
  @Input() removable = false;
  @Output() remove = new EventEmitter<void>();
}
