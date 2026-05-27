import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gw-file-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GwFileInputComponent), multi: true },
  ],
})
export class GwFileInputComponent implements ControlValueAccessor {
  @Input() multiple = false;
  @Input() accept: string | null = null;
  @Input() invalid = false;
  @Input() inputId: string | null = null;
  @Input() hint = 'Drag & drop or click to select';
  @Input() icon = 'upload-cloud';
  /** Max file size in MB; warn if exceeded (we don't enforce — let the form do it). */
  @Input() maxMb: number | null = null;

  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  readonly files = signal<File[]>([]);
  readonly disabled = signal<boolean>(false);
  readonly hovering = signal<boolean>(false);

  private onChange: (v: File | File[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    if (value == null) { this.files.set([]); return; }
    if (Array.isArray(value)) { this.files.set(value as File[]); return; }
    if (value instanceof File) { this.files.set([value]); return; }
    this.files.set([]);
  }
  registerOnChange(fn: (v: File | File[] | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  trigger() {
    if (this.disabled()) return;
    this.fileInputRef?.nativeElement.click();
  }

  onSelected(event: Event) {
    const list = (event.target as HTMLInputElement).files;
    this.applyFiles(list);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) { if (this.disabled()) return; event.preventDefault(); this.hovering.set(true); }

  @HostListener('dragleave', ['$event'])
  onDragLeave(_event: DragEvent) { this.hovering.set(false); }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.hovering.set(false);
    if (this.disabled()) return;
    this.applyFiles(event.dataTransfer?.files ?? null);
  }

  private applyFiles(list: FileList | null) {
    if (!list || !list.length) return;
    const arr = this.multiple ? Array.from(list) : [list[0]];
    this.files.set(arr);
    this.onChange(this.multiple ? arr : arr[0]);
    this.onTouched();
  }

  remove(i: number, event: Event) {
    event.stopPropagation();
    if (this.disabled()) return;
    const next = this.files().filter((_, idx) => idx !== i);
    this.files.set(next);
    this.onChange(this.multiple ? next : (next[0] ?? null));
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
