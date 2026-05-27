import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface GwRadioOption<T = string | number> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

let nextGroupId = 0;

@Component({
  selector: 'gw-radio-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwRadioGroupComponent), multi: true },
  ],
})
export class GwRadioGroupComponent implements ControlValueAccessor {
  @Input() options: GwRadioOption[] = [];
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  @Input() name = `gw-radio-${++nextGroupId}`;
  @Input() invalid = false;

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

  pick(option: GwRadioOption) {
    if (this.disabled() || option.disabled) return;
    this.value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
  }

  isChecked(option: GwRadioOption): boolean {
    return this.value() !== null && String(this.value()) === String(option.value);
  }
}
