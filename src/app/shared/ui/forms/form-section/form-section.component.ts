import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gw-form-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-section.component.html',
  styleUrl: './form-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GwFormSectionComponent {
  @Input() title = '';
  @Input() description: string | null = null;
  /** When true, the section can be collapsed by clicking the header. */
  @Input() collapsible = false;
  @Input() set collapsed(v: boolean) { this.isCollapsed.set(v); }

  readonly isCollapsed = signal<boolean>(false);

  toggle() {
    if (!this.collapsible) return;
    this.isCollapsed.update(v => !v);
  }
}
