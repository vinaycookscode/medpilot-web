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

export interface GwComboOption<T = string | number> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'gw-combobox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwComboboxComponent), multi: true },
  ],
})
export class GwComboboxComponent implements ControlValueAccessor {
  @Input({ required: true }) options: GwComboOption[] = [];
  @Input() placeholder = 'Select…';
  @Input() searchPlaceholder = 'Search…';
  @Input() emptyText = 'No matches';
  @Input() clearable = true;
  @Input() invalid = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inputId: string | null = null;

  @ViewChild('search') searchRef?: ElementRef<HTMLInputElement>;

  readonly value = signal<string | number | null>(null);
  readonly disabled = signal<boolean>(false);
  readonly open = signal<boolean>(false);
  readonly query = signal<string>('');
  readonly activeIndex = signal<number>(-1);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  });

  readonly selected = computed<GwComboOption | null>(() => {
    const v = this.value();
    if (v === null) return null;
    return this.options.find(o => String(o.value) === String(v)) ?? null;
  });

  private onChange: (v: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>) {}

  writeValue(value: unknown): void { this.value.set(value === undefined ? null : (value as any)); }
  registerOnChange(fn: (v: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  toggle() {
    if (this.disabled()) return;
    if (this.open()) this.close();
    else this.openPanel();
  }

  openPanel() {
    if (this.disabled()) return;
    this.open.set(true);
    this.query.set('');
    this.activeIndex.set(this.filtered().findIndex(o => this.isSelected(o)));
    queueMicrotask(() => this.searchRef?.nativeElement.focus());
  }

  close() {
    this.open.set(false);
    this.onTouched();
  }

  pick(opt: GwComboOption) {
    if (opt.disabled) return;
    this.value.set(opt.value);
    this.onChange(opt.value);
    this.close();
  }

  clear(event: Event) {
    event.stopPropagation();
    if (this.disabled()) return;
    this.value.set(null);
    this.onChange(null);
  }

  onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.filtered().length ? 0 : -1);
  }

  onSearchKeydown(event: KeyboardEvent) {
    const list = this.filtered();
    if (event.key === 'ArrowDown') {
      this.activeIndex.update(i => Math.min(list.length - 1, i + 1));
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.activeIndex.update(i => Math.max(0, i - 1));
      event.preventDefault();
    } else if (event.key === 'Enter') {
      const i = this.activeIndex();
      if (i >= 0 && list[i] && !list[i].disabled) this.pick(list[i]);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.close();
      event.preventDefault();
    }
  }

  isSelected(opt: GwComboOption): boolean {
    return this.value() !== null && String(this.value()) === String(opt.value);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    if (!this.open()) return;
    if (this.host.nativeElement.contains(event.target as Node)) return;
    this.close();
  }
}
