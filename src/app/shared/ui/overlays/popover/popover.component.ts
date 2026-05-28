import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwPopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type GwPopoverAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'gw-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwPopoverComponent implements OnChanges {
  /** Element the popover positions itself against. */
  @Input({ required: true }) anchor!: HTMLElement | ElementRef<HTMLElement>;
  @Input() open = false;
  @Input() placement: GwPopoverPlacement = 'bottom';
  @Input() align: GwPopoverAlign = 'start';
  @Input() offset = 6;
  /** When true (default), clicking outside the panel closes it. */
  @Input() dismissOnOutsideClick = true;
  @Input() dismissOnEscape = true;
  @Input() showArrow = false;
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('panel') panelRef?: ElementRef<HTMLDivElement>;

  readonly position = signal<{ top: number; left: number } | null>(null);
  private host = inject(ElementRef<HTMLElement>);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) queueMicrotask(() => this.reposition());
      else this.position.set(null);
    }
  }

  reposition() {
    const anchorEl = this.anchor instanceof ElementRef ? this.anchor.nativeElement : this.anchor;
    const panel = this.panelRef?.nativeElement;
    if (!anchorEl || !panel) return;

    const a = anchorEl.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    let top = 0, left = 0;

    switch (this.placement) {
      case 'bottom': top = a.bottom + this.offset; left = this.alignAxis(a.left, a.right, p.width); break;
      case 'top':    top = a.top - p.height - this.offset; left = this.alignAxis(a.left, a.right, p.width); break;
      case 'right':  left = a.right + this.offset; top = this.alignAxis(a.top, a.bottom, p.height); break;
      case 'left':   left = a.left - p.width - this.offset; top = this.alignAxis(a.top, a.bottom, p.height); break;
    }

    // Clamp to viewport
    const m = 8;
    left = Math.max(m, Math.min(left, window.innerWidth - p.width - m));
    top  = Math.max(m, Math.min(top,  window.innerHeight - p.height - m));

    this.position.set({ top: top + window.scrollY, left: left + window.scrollX });
  }

  private alignAxis(start: number, end: number, size: number): number {
    if (this.align === 'center') return (start + end) / 2 - size / 2;
    if (this.align === 'end') return end - size;
    return start;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocMouseDown(event: MouseEvent) {
    if (!this.open || !this.dismissOnOutsideClick) return;
    const anchorEl = this.anchor instanceof ElementRef ? this.anchor.nativeElement : this.anchor;
    const target = event.target as Node;
    if (anchorEl?.contains(target)) return;
    if (this.panelRef?.nativeElement.contains(target)) return;
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open && this.dismissOnEscape) this.close(); }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange() { if (this.open) this.reposition(); }

  close() { this.openChange.emit(false); }
}
