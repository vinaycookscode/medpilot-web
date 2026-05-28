import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Multi-line prompt input with auto-resize, send button, and Enter-to-send
 * (Shift+Enter for newline). Designed for AI chat surfaces.
 */
@Component({
  selector: 'gw-prompt-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prompt-input.component.html',
  styleUrl: './prompt-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwPromptInputComponent), multi: true },
  ],
})
export class GwPromptInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Ask anything…';
  @Input() maxLength: number | null = 4000;
  @Input() minRows = 1;
  @Input() maxRows = 8;
  @Input() submitLabel = 'Send';
  @Input() busy = false;
  @Output() submitPrompt = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();

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

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  send() {
    const v = this.value().trim();
    if (!v || this.disabled() || this.busy) return;
    this.submitPrompt.emit(v);
  }

  clear() {
    this.value.set('');
    this.onChange('');
    queueMicrotask(() => this.resize());
  }

  private resize() {
    if (!this.area) return;
    const el = this.area.nativeElement;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
    const maxHeight = lineHeight * this.maxRows + 24;  // padding allowance
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }
}
