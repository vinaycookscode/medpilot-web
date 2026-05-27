import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gw-search-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwSearchInputComponent), multi: true },
  ],
})
export class GwSearchInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Search…';
  @Input() debounceMs = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inputId: string | null = null;
  @Input() invalid = false;
  @Output() debouncedChange = new EventEmitter<string>();

  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};
  private timer: ReturnType<typeof setTimeout> | null = null;

  writeValue(value: unknown): void { this.value.set(value == null ? '' : String(value)); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
    this.scheduleDebounced(v);
  }

  clear() {
    if (this.disabled()) return;
    this.value.set('');
    this.onChange('');
    this.scheduleDebounced('');
  }

  handleBlur() { this.onTouched(); }

  private scheduleDebounced(v: string) {
    if (this.timer) clearTimeout(this.timer);
    if (this.debounceMs <= 0) { this.debouncedChange.emit(v); return; }
    this.timer = setTimeout(() => this.debouncedChange.emit(v), this.debounceMs);
  }
}
