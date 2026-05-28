import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

export type GwTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

let tooltipId = 0;

/**
 * Lightweight tooltip directive — appends a positioned element to <body> on
 * hover / focus, removes it on leave / blur.
 *
 *   <button [gwTooltip]="'Save changes'" gwTooltipPosition="top">Save</button>
 */
@Directive({
  selector: '[gwTooltip]',
  standalone: true,
})
export class GwTooltipDirective implements OnDestroy {
  @Input('gwTooltip') text: string | null = null;
  @Input() gwTooltipPosition: GwTooltipPosition = 'top';
  @Input() gwTooltipDelay = 120;
  @Input() gwTooltipDisabled = false;
  @Input() gwTooltipMaxWidth: number | null = 240;

  private host = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  private el: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter') onEnter() { this.schedule(); }
  @HostListener('focusin')    onFocus() { this.schedule(); }
  @HostListener('mouseleave') onLeave() { this.cancel(); this.hide(); }
  @HostListener('focusout')   onBlur()  { this.cancel(); this.hide(); }
  @HostListener('window:scroll') onScroll() { this.hide(); }

  ngOnDestroy() { this.cancel(); this.hide(); }

  private schedule() {
    if (this.gwTooltipDisabled || !this.text) return;
    this.cancel();
    this.timer = setTimeout(() => this.show(), this.gwTooltipDelay);
  }
  private cancel() { if (this.timer) { clearTimeout(this.timer); this.timer = null; } }

  private show() {
    if (this.el || !this.text) return;
    const id = `gw-tt-${++tooltipId}`;
    const el = this.renderer.createElement('div') as HTMLDivElement;
    el.id = id;
    el.className = `gw-tooltip gw-tooltip--${this.gwTooltipPosition}`;
    el.setAttribute('role', 'tooltip');
    if (this.gwTooltipMaxWidth) el.style.maxWidth = `${this.gwTooltipMaxWidth}px`;
    el.textContent = this.text;

    const arrow = this.renderer.createElement('span') as HTMLSpanElement;
    arrow.className = 'gw-tooltip__arrow';
    el.appendChild(arrow);

    this.renderer.appendChild(document.body, el);
    this.position(el);

    // Animate in
    requestAnimationFrame(() => el.classList.add('is-visible'));

    this.el = el;
    this.host.nativeElement.setAttribute('aria-describedby', id);
  }

  private hide() {
    if (!this.el) return;
    const node = this.el;
    node.classList.remove('is-visible');
    this.host.nativeElement.removeAttribute('aria-describedby');
    setTimeout(() => node.remove(), 120);
    this.el = null;
  }

  private position(el: HTMLElement) {
    const trigger = this.host.nativeElement.getBoundingClientRect();
    const ttRect = el.getBoundingClientRect();
    const gap = 8;
    let top = 0, left = 0;

    switch (this.gwTooltipPosition) {
      case 'top':
        top = trigger.top - ttRect.height - gap;
        left = trigger.left + trigger.width / 2 - ttRect.width / 2;
        break;
      case 'bottom':
        top = trigger.bottom + gap;
        left = trigger.left + trigger.width / 2 - ttRect.width / 2;
        break;
      case 'left':
        top = trigger.top + trigger.height / 2 - ttRect.height / 2;
        left = trigger.left - ttRect.width - gap;
        break;
      case 'right':
        top = trigger.top + trigger.height / 2 - ttRect.height / 2;
        left = trigger.right + gap;
        break;
    }

    // Clamp to viewport with 8px margin
    const margin = 8;
    left = Math.max(margin, Math.min(left, window.innerWidth - ttRect.width - margin));
    top  = Math.max(margin, Math.min(top,  window.innerHeight - ttRect.height - margin));

    el.style.top  = `${top + window.scrollY}px`;
    el.style.left = `${left + window.scrollX}px`;
  }
}
