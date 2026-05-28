import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwStepStatus = 'pending' | 'current' | 'complete' | 'error';

export interface GwStep {
  key?: string;
  label: string;
  description?: string;
  /** Override the derived status (otherwise: index < active = complete, == active = current, else = pending). */
  status?: GwStepStatus;
  /** Disable navigation jump on click. */
  disabled?: boolean;
}

export type GwStepperOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'gw-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-step-host',
    '[class.gw-step-host--vertical]': "orientation === 'vertical'",
    '[attr.role]': "'group'",
    '[attr.aria-label]': "'Progress steps'",
  },
})
export class GwStepperComponent {
  @Input({ required: true }) steps: GwStep[] = [];
  @Input() active = 0;
  @Input() orientation: GwStepperOrientation = 'horizontal';
  /** Allow clicking a completed step to jump back. Current/pending always blocked. */
  @Input() clickable = false;
  @Output() stepClick = new EventEmitter<{ step: GwStep; index: number }>();

  status(step: GwStep, index: number): GwStepStatus {
    if (step.status) return step.status;
    if (index < this.active)  return 'complete';
    if (index === this.active) return 'current';
    return 'pending';
  }

  canClick(step: GwStep, index: number): boolean {
    if (!this.clickable || step.disabled) return false;
    const s = this.status(step, index);
    return s === 'complete';
  }

  handleClick(step: GwStep, index: number) {
    if (!this.canClick(step, index)) return;
    this.stepClick.emit({ step, index });
  }
}
