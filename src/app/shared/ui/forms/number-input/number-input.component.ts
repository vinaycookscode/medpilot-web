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
  selector: 'gw-number-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwNumberInputComponent), multi: true },
  ],
})
export class GwNumberInputComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step = 1;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  /** Show +/- stepper buttons (default true). */
  @Input() steppers = true;

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
    const raw = (event.target as HTMLInputElement).value;
    const next = raw === '' ? null : Number(raw);
    this.value.set(next);
    this.onChange(next);
  }
  handleBlur() { this.onTouched(); }

  increment() { this.shift(+this.step); }
  decrement() { this.shift(-this.step); }

  private shift(by: number) {
    if (this.disabled()) return;
    const base = this.value() ?? 0;
    let next = base + by;
    if (this.min !== null && next < this.min) next = this.min;
    if (this.max !== null && next > this.max) next = this.max;
    this.value.set(next);
    this.onChange(next);
  }

  get atMin() { return this.value() !== null && this.min !== null && this.value()! <= this.min; }
  get atMax() { return this.value() !== null && this.max !== null && this.value()! >= this.max; }
}
