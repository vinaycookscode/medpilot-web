import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface GwSegmentOption<T = string | number> {
  value: T;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'gw-segmented',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwSegmentedComponent), multi: true },
  ],
})
export class GwSegmentedComponent implements ControlValueAccessor {
  @Input({ required: true }) options: GwSegmentOption[] = [];
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() block = false;
  @Input() invalid = false;

  readonly value = signal<string | number | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void { this.value.set(value === undefined ? null : (value as any)); }
  registerOnChange(fn: (v: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  pick(option: GwSegmentOption) {
    if (this.disabled() || option.disabled) return;
    this.value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
  }

  isActive(option: GwSegmentOption): boolean {
    return this.value() !== null && String(this.value()) === String(option.value);
  }
}
