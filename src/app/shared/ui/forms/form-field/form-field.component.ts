import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

let nextFieldId = 0;

/**
 * Layout wrapper for any gw-* control. Provides a label, optional hint and
 * an error message. Generates a stable `for` id that a control inside can
 * adopt via the GwFormFieldContext (see [[input.component]]).
 */
@Component({
  selector: 'gw-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-field',
    '[class.gw-field--error]': '!!error',
    '[class.gw-field--inline]': 'inline',
  },
})
export class GwFormFieldComponent {
  /** Visible label rendered above the control. Omit to render no label. */
  @Input() label = '';
  /** Optional helper text below the control. Hidden when an error shows. */
  @Input() hint: string | null = null;
  /** Inline error message. When set, the field flips to error styling. */
  @Input() error: string | null = null;
  /** When true, marks the field as required (adds a red asterisk). */
  @Input() required = false;
  /** Compact layout — label on the same row as the control (used for checkbox/toggle). */
  @Input() inline = false;

  readonly fieldId = signal(`gw-field-${++nextFieldId}`);
  readonly describedById = computed(() =>
    this.error ? `${this.fieldId()}-error` : this.hint ? `${this.fieldId()}-hint` : null,
  );
}
