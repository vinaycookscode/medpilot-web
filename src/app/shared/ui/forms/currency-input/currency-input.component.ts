import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gw-currency-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-input.component.html',
  styleUrl: './currency-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwCurrencyInputComponent), multi: true },
  ],
})
export class GwCurrencyInputComponent implements ControlValueAccessor {
  @Input() symbol = '₹';
  @Input() placeholder = '0.00';
  @Input() decimals = 2;
  @Input() min: number | null = 0;
  @Input() max: number | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() invalid = false;
  @Input() inputId: string | null = null;

  readonly value = signal<number | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value === '' || value === null || value === undefined ? null : Number(value));
  }
  registerOnChange(fn: (v: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) {
    const el = event.target as HTMLInputElement;
    const raw = el.value;
    const next = raw === '' ? null : Number(raw);
    this.value.set(next);
    this.onChange(next);
  }

  handleBlur(event: Event) {
    this.onTouched();
    const v = this.value();
    if (v === null) return;
    const factor = Math.pow(10, this.decimals);
    const rounded = Math.round(v * factor) / factor;
    if (rounded !== v) {
      this.value.set(rounded);
      this.onChange(rounded);
    }
  }

  get step(): number { return 1 / Math.pow(10, this.decimals); }
}
