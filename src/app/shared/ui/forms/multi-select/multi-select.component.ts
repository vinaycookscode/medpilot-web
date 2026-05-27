import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  computed,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { GwComboOption } from '../combobox/combobox.component';

export type GwMultiOption<T = string | number> = GwComboOption<T>;

@Component({
  selector: 'gw-multi-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwMultiSelectComponent), multi: true },
  ],
})
export class GwMultiSelectComponent implements ControlValueAccessor {
  @Input({ required: true }) options: GwMultiOption[] = [];
  @Input() placeholder = 'Select…';
  @Input() searchPlaceholder = 'Search…';
  @Input() emptyText = 'No matches';
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  @Input() maxChips = 3;

  @ViewChild('search') searchRef?: ElementRef<HTMLInputElement>;

  readonly values = signal<Array<string | number>>([]);
  readonly disabled = signal<boolean>(false);
  readonly open = signal<boolean>(false);
  readonly query = signal<string>('');
  readonly activeIndex = signal<number>(-1);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  });

  readonly chips = computed(() =>
    this.values()
      .map(v => this.options.find(o => String(o.value) === String(v)))
      .filter((x): x is GwMultiOption => !!x),
  );

  readonly visibleChips = computed(() => this.chips().slice(0, this.maxChips));
  readonly overflowCount = computed(() => Math.max(0, this.chips().length - this.maxChips));

  private onChange: (v: Array<string | number>) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>) {}

  writeValue(value: unknown): void {
    const arr = Array.isArray(value) ? (value as Array<string | number>) : [];
    this.values.set(arr);
  }
  registerOnChange(fn: (v: Array<string | number>) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  toggle() {
    if (this.disabled()) return;
    this.open() ? this.close() : this.openPanel();
  }

  openPanel() {
    if (this.disabled()) return;
    this.open.set(true);
    this.activeIndex.set(0);
    queueMicrotask(() => this.searchRef?.nativeElement.focus());
  }

  close() { this.open.set(false); this.onTouched(); }

  toggleOpt(opt: GwMultiOption) {
    if (opt.disabled) return;
    const cur = this.values();
    const idx = cur.findIndex(v => String(v) === String(opt.value));
    const next = idx >= 0 ? cur.filter((_, i) => i !== idx) : [...cur, opt.value];
    this.values.set(next);
    this.onChange(next);
  }

  remove(opt: GwMultiOption, event: Event) {
    event.stopPropagation();
    if (this.disabled()) return;
    const next = this.values().filter(v => String(v) !== String(opt.value));
    this.values.set(next);
    this.onChange(next);
  }

  clearAll(event: Event) {
    event.stopPropagation();
    if (this.disabled()) return;
    this.values.set([]);
    this.onChange([]);
  }

  isSelected(opt: GwMultiOption): boolean {
    return this.values().some(v => String(v) === String(opt.value));
  }

  onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.filtered().length ? 0 : -1);
  }

  onSearchKeydown(event: KeyboardEvent) {
    const list = this.filtered();
    if (event.key === 'ArrowDown') { this.activeIndex.update(i => Math.min(list.length - 1, i + 1)); event.preventDefault(); }
    else if (event.key === 'ArrowUp') { this.activeIndex.update(i => Math.max(0, i - 1)); event.preventDefault(); }
    else if (event.key === 'Enter') {
      const i = this.activeIndex();
      if (i >= 0 && list[i] && !list[i].disabled) this.toggleOpt(list[i]);
      event.preventDefault();
    } else if (event.key === 'Escape') { this.close(); event.preventDefault(); }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    if (!this.open()) return;
    if (this.host.nativeElement.contains(event.target as Node)) return;
    this.close();
  }
}
