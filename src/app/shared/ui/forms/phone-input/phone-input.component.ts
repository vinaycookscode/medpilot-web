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
  selector: 'gw-phone-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwPhoneInputComponent), multi: true },
  ],
})
export class GwPhoneInputComponent implements ControlValueAccessor {
  @Input() countryCode = '+91';
  @Input() placeholder = '99999 99999';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  /** When true, value stored is just the local number; when false, includes the country code. */
  @Input() storeWithCountryCode = true;

  readonly local = signal<string>('');
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    const s = value == null ? '' : String(value);
    if (this.storeWithCountryCode && s.startsWith(this.countryCode)) {
      this.local.set(s.slice(this.countryCode.length).trim());
    } else {
      this.local.set(s);
    }
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^\d\s\-]/g, '');
    this.local.set(raw);
    this.onChange(this.storeWithCountryCode ? `${this.countryCode} ${raw.trim()}`.trim() : raw);
  }
  handleBlur() { this.onTouched(); }
}
