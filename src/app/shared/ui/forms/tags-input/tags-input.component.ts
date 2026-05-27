import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gw-tags-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tags-input.component.html',
  styleUrl: './tags-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwTagsInputComponent), multi: true },
  ],
})
export class GwTagsInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Add tag…';
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  @Input() max: number | null = null;
  @Input() allowDuplicates = false;

  readonly tags = signal<string[]>([]);
  readonly draft = signal<string>('');
  readonly disabled = signal<boolean>(false);

  private onChange: (v: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.tags.set(Array.isArray(value) ? (value as string[]) : []);
  }
  registerOnChange(fn: (v: string[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  handleInput(event: Event) { this.draft.set((event.target as HTMLInputElement).value); }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      this.commit();
      event.preventDefault();
    } else if (event.key === 'Backspace' && this.draft() === '' && this.tags().length) {
      const next = this.tags().slice(0, -1);
      this.tags.set(next);
      this.onChange(next);
    }
  }

  handleBlur() {
    this.commit();
    this.onTouched();
  }

  commit() {
    const raw = this.draft().trim().replace(/,$/, '').trim();
    if (!raw) { this.draft.set(''); return; }
    if (this.max !== null && this.tags().length >= this.max) { this.draft.set(''); return; }
    if (!this.allowDuplicates && this.tags().includes(raw)) { this.draft.set(''); return; }
    const next = [...this.tags(), raw];
    this.tags.set(next);
    this.draft.set('');
    this.onChange(next);
  }

  remove(i: number, event: Event) {
    event.stopPropagation();
    if (this.disabled()) return;
    const next = this.tags().filter((_, idx) => idx !== i);
    this.tags.set(next);
    this.onChange(next);
  }
}
