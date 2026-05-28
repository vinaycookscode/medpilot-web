import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  AfterContentInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwAccordionItemComponent } from './accordion-item.component';

@Component({
  selector: 'gw-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-accordion',
    '[class.gw-accordion--bordered]': 'bordered',
    '[class.gw-accordion--separated]': 'separated',
  },
})
export class GwAccordionComponent implements AfterContentInit {
  /** Multiple items can be open at once. */
  @Input() multi = false;
  @Input() bordered = true;
  /** Each item is a standalone card with a gap between them. */
  @Input() separated = false;

  @ContentChildren(GwAccordionItemComponent) items!: QueryList<GwAccordionItemComponent>;

  ngAfterContentInit() {
    this.items.forEach(item => {
      item.toggled.subscribe(() => this.handleToggle(item));
    });
  }

  private handleToggle(target: GwAccordionItemComponent) {
    if (this.multi) {
      target.expanded.update(v => !v);
      return;
    }
    const wasOpen = target.expanded();
    this.items.forEach(i => i.expanded.set(false));
    if (!wasOpen) target.expanded.set(true);
  }
}
