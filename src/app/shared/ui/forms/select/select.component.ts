import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface GwSelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'gw-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwSelectComponent), multi: true },
  ],
})
export class GwSelectComponent implements ControlValueAccessor {
  @Input() options: GwSelectOption[] = [];
  @Input() placeholder = 'Select…';
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  readonly value = signal<string | number | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value === undefined ? null : (value as string | number | null));
  }
  registerOnChange(fn: (v: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleChange(event: Event) {
    const raw = (event.target as HTMLSelectElement).value;
    if (raw === '') { this.value.set(null); this.onChange(null); return; }
    const match = this.options.find(o => String(o.value) === raw);
    const next = match ? match.value : raw;
    this.value.set(next);
    this.onChange(next);
  }
  handleBlur() { this.onTouched(); }

  isSelected(opt: GwSelectOption): boolean {
    return this.value() !== null && String(this.value()) === String(opt.value);
  }
}
