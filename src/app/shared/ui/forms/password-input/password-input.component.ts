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
  selector: 'gw-password-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwPasswordInputComponent), multi: true },
  ],
})
export class GwPasswordInputComponent implements ControlValueAccessor {
  @Input() placeholder = '••••••••';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  @Input() autocomplete: 'current-password' | 'new-password' | 'off' = 'current-password';
  /** Show strength meter underneath the input. */
  @Input() showStrength = false;

  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);
  readonly revealed = signal<boolean>(false);

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

  toggle() {
    if (this.disabled()) return;
    this.revealed.update(v => !v);
  }

  /** 0..4 score using simple heuristics. */
  get strength(): number {
    const v = this.value();
    if (!v) return 0;
    let s = 0;
    if (v.length >= 8)  s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v))   s++;
    if (/[^\w\s]/.test(v)) s++;
    return Math.min(s, 4);
  }

  get strengthLabel(): string {
    return ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'][this.strength];
  }
}
