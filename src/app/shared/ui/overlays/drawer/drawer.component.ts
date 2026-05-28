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
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwDrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type GwDrawerSize = 'sm' | 'md' | 'lg' | 'xl';

let openDrawers = 0;

@Component({
  selector: 'gw-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwDrawerComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() side: GwDrawerSide = 'right';
  @Input() size: GwDrawerSize = 'md';
  @Input() title: string | null = null;
  @Input() description: string | null = null;
  @Input() showClose = true;
  @Input() dismissOnBackdrop = true;
  @Input() dismissOnEscape = true;
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
    if (openDrawers === 0) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    }
    openDrawers++;
  }
  private unlockScroll() {
    openDrawers = Math.max(0, openDrawers - 1);
    if (openDrawers === 0) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }
}
