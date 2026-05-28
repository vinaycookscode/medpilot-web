import { Directive, Input, TemplateRef, inject } from '@angular/core';

/**
 * Names a TemplateRef so that GwTableComponent can use it as the cell
 * renderer for a given column key.
 *
 *   <ng-template gwCell="status" let-row>
 *     <gw-badge [variant]="row.status === 'active' ? 'success' : 'neutral'">
 *       {{ row.status }}
 *     </gw-badge>
 *   </ng-template>
 */
@Directive({
  selector: '[gwCell]',
  standalone: true,
})
export class GwCellDirective {
  @Input({ required: true, alias: 'gwCell' }) key!: string;
  readonly template = inject(TemplateRef<{ $implicit: any; row: any; rowIndex: number }>);
}
