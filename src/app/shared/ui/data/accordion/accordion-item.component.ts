import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

let nextItemId = 0;

@Component({
  selector: 'gw-accordion-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-acc-item',
    '[class.is-open]': 'expanded()',
    '[class.is-disabled]': 'disabled',
  },
})
export class GwAccordionItemComponent {
  @Input() title = '';
  @Input() description: string | null = null;
  @Input() icon: string | null = null;
  @Input() disabled = false;
  @Input() set open(v: boolean) { this.expanded.set(v); }
  @Output() toggled = new EventEmitter<void>();

  readonly expanded = signal<boolean>(false);
  readonly id = `gw-acc-${++nextItemId}`;

  handleHeaderClick() {
    if (this.disabled) return;
    this.toggled.emit();
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleHeaderClick();
    }
  }
}
