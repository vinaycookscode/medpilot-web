import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChildren,
  QueryList,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gw-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwOtpInputComponent), multi: true },
  ],
})
export class GwOtpInputComponent implements ControlValueAccessor {
  @Input() length = 6;
  @Input() invalid = false;
  /** Restrict to digits 0-9. When false, accepts letters too. */
  @Input() digitsOnly = true;

  readonly slots = signal<string[]>(Array(6).fill(''));
  readonly disabled = signal<boolean>(false);

  @ViewChildren('slot') slotRefs?: QueryList<ElementRef<HTMLInputElement>>;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() { this.slots.set(Array(this.length).fill('')); }

  get slotIndices(): number[] {
    return Array.from({ length: this.length }, (_, i) => i);
  }

  writeValue(value: unknown): void {
    const s = value == null ? '' : String(value);
    const arr = Array(this.length).fill('').map((_, i) => s[i] ?? '');
    this.slots.set(arr);
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  private emit() { this.onChange(this.slots().join('')); }

  handleInput(index: number, event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const ch = (this.digitsOnly ? raw.replace(/\D/g, '') : raw).slice(-1);
    const arr = [...this.slots()];
    arr[index] = ch;
    this.slots.set(arr);
    this.emit();
    if (ch && index < this.length - 1) this.focus(index + 1);
  }

  handleKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const arr = [...this.slots()];
      if (arr[index]) {
        arr[index] = '';
        this.slots.set(arr);
        this.emit();
      } else if (index > 0) {
        arr[index - 1] = '';
        this.slots.set(arr);
        this.emit();
        this.focus(index - 1);
      }
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focus(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < this.length - 1) {
      this.focus(index + 1);
      event.preventDefault();
    }
  }

  handlePaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text') ?? '';
    const cleaned = this.digitsOnly ? text.replace(/\D/g, '') : text;
    if (!cleaned) return;
    const arr = Array(this.length).fill('').map((_, i) => cleaned[i] ?? '');
    this.slots.set(arr);
    this.emit();
    const nextEmpty = Math.min(cleaned.length, this.length - 1);
    this.focus(nextEmpty);
    event.preventDefault();
  }

  handleBlur() { this.onTouched(); }

  private focus(i: number) {
    queueMicrotask(() => {
      this.slotRefs?.get(i)?.nativeElement.focus();
      this.slotRefs?.get(i)?.nativeElement.select();
    });
  }
}
