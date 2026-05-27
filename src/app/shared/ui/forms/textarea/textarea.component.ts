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

@Component({
  selector: 'gw-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwTextareaComponent), multi: true },
  ],
})
export class GwTextareaComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() autoResize = false;
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  @Input() maxLength: number | null = null;

  @ViewChild('area') area?: ElementRef<HTMLTextAreaElement>;

  readonly value = signal<string>('');
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
    queueMicrotask(() => this.resize());
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) {
    const v = (event.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
    this.resize();
  }
  handleBlur() { this.onTouched(); }

  private resize() {
    if (!this.autoResize || !this.area) return;
    const el = this.area.nativeElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}
