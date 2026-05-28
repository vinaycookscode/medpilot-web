import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

export type GwInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type GwInputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'gw-input',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwInputComponent), multi: true },
  ],
  host: { 'class': 'gw-input-host' },
})
export class GwInputComponent implements ControlValueAccessor {
  @Input() type: GwInputType = 'text';
  @Input() placeholder = '';
  @Input() size: GwInputSize = 'md';
  @Input() invalid = false;
  @Input() autocomplete: string | null = null;
  /** Optional leading icon name (lucide). Pass null to omit. */
  @Input() leadingIcon: string | null = null;
  /** Optional trailing icon name (lucide). Pass null to omit. */
  @Input() trailingIcon: string | null = null;
  @Input() inputId: string | null = null;

  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;

  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  handleBlur() { this.onTouched(); }

  focus() { this.inputRef?.nativeElement.focus(); }
}
