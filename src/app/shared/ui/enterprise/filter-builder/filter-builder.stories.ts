import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwFilterBuilderComponent, GwFilterField, GwFilterRule } from './filter-builder.component';

const meta: Meta<GwFilterBuilderComponent> = {
  title: 'Enterprise/Filter Builder',
  component: GwFilterBuilderComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwFilterBuilderComponent] })],
};
export default meta;
type Story = StoryObj<GwFilterBuilderComponent>;

const FIELDS: GwFilterField[] = [
  { key: 'name',   label: 'Patient name', type: 'text' },
  { key: 'age',    label: 'Age',          type: 'number' },
  { key: 'ward',   label: 'Ward',         type: 'select', options: [
    { value: 'icu', label: 'ICU' }, { value: 'gen', label: 'General' }, { value: 'mat', label: 'Maternity' },
  ]},
  { key: 'status', label: 'Status',       type: 'select', options: [
    { value: 'admitted', label: 'Admitted' }, { value: 'discharged', label: 'Discharged' },
  ]},
  { key: 'admittedAt', label: 'Admitted on', type: 'date' },
];

const SEED: GwFilterRule[] = [
  { id: 'r1', field: 'ward', operator: 'eq', value: 'icu' },
  { id: 'r2', field: 'age',  operator: 'gte', value: 60 },
];

export const Default: Story = {
  render: () => ({
    props: { fields: FIELDS, rules: signal<GwFilterRule[]>(SEED) },
    template: `<div style="max-width:740px;"><gw-filter-builder [fields]="fields" [rules]="rules()" (rulesChange)="rules.set($event)" /></div>`,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { fields: FIELDS, rules: signal<GwFilterRule[]>([]) },
    template: `<div style="max-width:740px;"><gw-filter-builder [fields]="fields" [rules]="rules()" (rulesChange)="rules.set($event)" /></div>`,
  }),
};
