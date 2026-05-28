import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

let openDialogs = 0;

@Component({
  selector: 'gw-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwDialogComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() title: string | null = null;
  @Input() description: string | null = null;
  @Input() size: GwDialogSize = 'md';
  @Input() dismissOnBackdrop = true;
  @Input() dismissOnEscape = true;
  @Input() showClose = true;
  /** Hide built-in header so a [gw-dialog-header] projection can take over. */
  @Input() bareHeader = false;
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('panel') panelRef?: ElementRef<HTMLDivElement>;
  private previouslyFocused: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;
    if (this.open) {
      this.previouslyFocused = document.activeElement as HTMLElement;
      this.lockScroll();
      queueMicrotask(() => this.focusFirst());
    } else {
      this.unlockScroll();
      this.previouslyFocused?.focus?.();
    }
  }

  ngOnDestroy(): void { if (this.open) this.unlockScroll(); }

  close() { if (this.open) this.openChange.emit(false); }

  onBackdrop(event: MouseEvent) {
    if (!this.dismissOnBackdrop) return;
    if (event.target === event.currentTarget) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() { if (this.open && this.dismissOnEscape) this.close(); }

  private focusFirst() {
    const panel = this.panelRef?.nativeElement;
    if (!panel) return;
    const focusable = panel.querySelector<HTMLElement>(
      'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? panel).focus();
  }

  private lockScroll() {
    if (openDialogs === 0) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    }
    openDialogs++;
  }
  private unlockScroll() {
    openDialogs = Math.max(0, openDialogs - 1);
    if (openDialogs === 0) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }
}
