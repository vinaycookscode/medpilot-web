import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwRadioGroupComponent } from './radio-group.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwRadioGroupComponent> = {
  title: 'Forms/Radio Group',
  component: GwRadioGroupComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule, GwRadioGroupComponent, GwFormFieldComponent],
    }),
  ],
};
export default meta;

const ADMIT_TYPE = [
  { value: 'opd', label: 'OPD', hint: 'Outpatient — same day discharge.' },
  { value: 'ipd', label: 'IPD', hint: 'Admit to bed; expect overnight stay.' },
  { value: 'er',  label: 'Emergency', hint: 'Triage, immediate care.' },
];

type Story = StoryObj<GwRadioGroupComponent>;

export const Basic: Story = {
  args: { options: ADMIT_TYPE },
};

export const Horizontal: Story = {
  args: { options: ADMIT_TYPE.map(({ value, label }) => ({ value, label })), orientation: 'horizontal' },
};

export const WithFormField: Story = {
  render: () => ({
    props: { options: ADMIT_TYPE, ctrl: new FormControl<string | null>('opd') },
    template: `
      <gw-form-field label="Admission type" hint="Determines available workflows." required>
        <gw-radio-group [options]="options" [formControl]="ctrl" />
      </gw-form-field>
      <p style="margin-top:12px;font-size:12px;color:#6c6c70;">Selected: {{ ctrl.value }}</p>
    `,
  }),
};

export const Invalid: Story = {
  render: () => ({
    props: { options: ADMIT_TYPE },
    template: `
      <gw-form-field label="Admission type" error="Choose one to continue." required>
        <gw-radio-group [options]="options" [invalid]="true" />
      </gw-form-field>
    `,
  }),
};
