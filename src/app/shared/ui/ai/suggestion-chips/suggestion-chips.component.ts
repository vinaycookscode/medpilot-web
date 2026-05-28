import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GwSuggestion {
  label: string;
  icon?: string;
  /** Optional payload returned with the click event. */
  payload?: unknown;
}

@Component({
  selector: 'gw-suggestion-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gw-sg" [class.gw-sg--wrap]="wrap">
      @for (s of items; track s.label) {
        <button type="button" class="gw-sg__chip" (click)="pick.emit(s)">
          @if (s.icon) { <i class="gw-sg__icon" [attr.data-lucide]="s.icon" aria-hidden="true"></i> }
          <span>{{ s.label }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './suggestion-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwSuggestionChipsComponent {
  @Input({ required: true }) items: GwSuggestion[] = [];
  /** Wrap to multiple lines instead of horizontal scroll. */
  @Input() wrap = true;
  @Output() pick = new EventEmitter<GwSuggestion>();
}
