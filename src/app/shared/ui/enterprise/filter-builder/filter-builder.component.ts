import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwFilterOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'starts' | 'ends' | 'in' | 'between';

export interface GwFilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ value: string | number; label: string }>;
}

export interface GwFilterRule {
  id: string;
  field: string;
  operator: GwFilterOperator;
  value: string | number | null;
}

let nextRuleId = 1;

@Component({
  selector: 'gw-filter-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-builder.component.html',
  styleUrl: './filter-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'gw-fb-host' },
})
export class GwFilterBuilderComponent {
  @Input({ required: true }) fields: GwFilterField[] = [];
  @Input() set rules(v: GwFilterRule[]) { this.rulesSig.set(v ?? []); }
  @Input() combinator: 'AND' | 'OR' = 'AND';
  @Output() rulesChange = new EventEmitter<GwFilterRule[]>();
  @Output() combinatorChange = new EventEmitter<'AND' | 'OR'>();

  readonly rulesSig = signal<GwFilterRule[]>([]);

  operatorsFor(field?: GwFilterField): { value: GwFilterOperator; label: string }[] {
    if (!field) return [];
    const text = [
      { value: 'eq' as GwFilterOperator, label: 'equals' },
      { value: 'neq' as GwFilterOperator, label: 'not equal' },
      { value: 'contains' as GwFilterOperator, label: 'contains' },
      { value: 'starts' as GwFilterOperator, label: 'starts with' },
      { value: 'ends' as GwFilterOperator, label: 'ends with' },
    ];
    const num = [
      { value: 'eq' as GwFilterOperator, label: '=' },
      { value: 'neq' as GwFilterOperator, label: '≠' },
      { value: 'gt' as GwFilterOperator, label: '>' },
      { value: 'gte' as GwFilterOperator, label: '≥' },
      { value: 'lt' as GwFilterOperator, label: '<' },
      { value: 'lte' as GwFilterOperator, label: '≤' },
    ];
    if (field.type === 'number') return num;
    if (field.type === 'date')   return num;
    if (field.type === 'select') return [
      { value: 'eq', label: 'is' },
      { value: 'neq', label: 'is not' },
    ];
    return text;
  }

  fieldFor(key: string): GwFilterField | undefined { return this.fields.find(f => f.key === key); }

  addRule() {
    const first = this.fields[0];
    if (!first) return;
    const r: GwFilterRule = {
      id: `r${nextRuleId++}`,
      field: first.key,
      operator: this.operatorsFor(first)[0].value,
      value: null,
    };
    this.update([...this.rulesSig(), r]);
  }

  removeRule(id: string) {
    this.update(this.rulesSig().filter(r => r.id !== id));
  }

  updateRule(id: string, patch: Partial<GwFilterRule>) {
    this.update(this.rulesSig().map(r => r.id === id ? { ...r, ...patch } : r));
  }

  toggleCombinator() {
    const next: 'AND' | 'OR' = this.combinator === 'AND' ? 'OR' : 'AND';
    this.combinator = next;
    this.combinatorChange.emit(next);
  }

  clear() { this.update([]); }

  private update(rules: GwFilterRule[]) {
    this.rulesSig.set(rules);
    this.rulesChange.emit(rules);
  }
}
