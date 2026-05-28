import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface GwSuggestion {
  label: string;
  icon?: string;
  /** Optional payload returned with the click event. */
  payload?: unknown;
}

@Component({
  selector: 'gw-suggestion-chips',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="gw-sg" [class.gw-sg--wrap]="wrap">
      @for (s of items; track s.label) {
        <button type="button" class="gw-sg__chip" (click)="pick.emit(s)">
          @if (s.icon) { <lucide-icon class="gw-sg__icon" [name]="s.icon!" [size]="12" /> }
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
