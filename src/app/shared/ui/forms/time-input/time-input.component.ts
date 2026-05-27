import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gw-time-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-input.component.html',
  styleUrls: ['../date-input/date-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwTimeInputComponent), multi: true },
  ],
})
export class GwTimeInputComponent implements ControlValueAccessor {
  @Input() min: string | null = null;
  @Input() max: string | null = null;
  @Input() step: number | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() invalid = false;
  @Input() inputId: string | null = null;

  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void { this.value.set(value == null ? '' : String(value)); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }
  handleBlur() { this.onTouched(); }
}
