import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { GwTabComponent } from './tab.component';

export type GwTabsVariant = 'line' | 'pill' | 'segmented';
export type GwTabsSize = 'sm' | 'md';

@Component({
  selector: 'gw-tabs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-tabs-host',
    '[class.gw-tabs-host--pill]': "variant === 'pill'",
    '[class.gw-tabs-host--segmented]': "variant === 'segmented'",
    '[class.gw-tabs-host--sm]': "size === 'sm'",
    '[class.gw-tabs-host--fitted]': 'fitted',
  },
})
export class GwTabsComponent implements AfterContentInit, OnChanges {
  @Input() variant: GwTabsVariant = 'line';
  @Input() size: GwTabsSize = 'md';
  @Input() activeKey: string | null = null;
  /** Stretch tabs to fill the available width. */
  @Input() fitted = false;
  @Output() activeKeyChange = new EventEmitter<string>();

  @ContentChildren(GwTabComponent) tabs!: QueryList<GwTabComponent>;

  ngAfterContentInit() {
    if (!this.activeKey && this.tabs.length) {
      const first = this.tabs.find(t => !t.disabled);
      if (first) this.setActive(first.key, false);
    } else {
      this.applyActive();
    }
    this.tabs.changes.subscribe(() => this.applyActive());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeKey'] && this.tabs) this.applyActive();
  }

  private applyActive() {
    if (!this.tabs) return;
    this.tabs.forEach(t => t.active.set(t.key === this.activeKey));
  }

  setActive(key: string, emit = true) {
    const target = this.tabs.find(t => t.key === key);
    if (!target || target.disabled) return;
    this.activeKey = key;
    this.applyActive();
    if (emit) this.activeKeyChange.emit(key);
  }

  onHeaderKeydown(event: KeyboardEvent, current: GwTabComponent) {
    const list = this.tabs.toArray().filter(t => !t.disabled);
    const idx = list.indexOf(current);
    if (idx < 0) return;

    let next: GwTabComponent | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = list[(idx + 1) % list.length];
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = list[(idx - 1 + list.length) % list.length];
    else if (event.key === 'Home') next = list[0];
    else if (event.key === 'End')  next = list[list.length - 1];

    if (next) {
      this.setActive(next.key);
      event.preventDefault();
    }
  }
}
