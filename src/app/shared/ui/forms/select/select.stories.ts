import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwSelectComponent } from './select.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwSelectComponent> = {
  title: 'Forms/Select',
  component: GwSelectComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule, GwSelectComponent, GwFormFieldComponent],
    }),
  ],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

const ROLES = [
  { value: 'consultant', label: 'Consultant' },
  { value: 'rmo',        label: 'RMO' },
  { value: 'nursing',    label: 'Nursing' },
  { value: 'attendant',  label: 'Attendant' },
  { value: 'security',   label: 'Security' },
];

type Story = StoryObj<GwSelectComponent>;

export const Basic: Story = {
  args: { options: ROLES, placeholder: 'Pick a role…' },
};

export const WithFormField: Story = {
  render: () => ({
    props: { roles: ROLES, ctrl: new FormControl<string | null>(null) },
    template: `
      <gw-form-field label="Role" hint="Drives sidebar + permissions." required>
        <gw-select [options]="roles" [formControl]="ctrl" placeholder="Select role…" />
      </gw-form-field>
      <p style="margin-top:8px;font-size:12px;color:#6c6c70;">Selected: {{ ctrl.value ?? '(none)' }}</p>
    `,
  }),
};

export const ErrorState: Story = {
  render: () => ({
    props: { roles: ROLES },
    template: `
      <gw-form-field label="Role" error="Role is required." required>
        <gw-select [options]="roles" [invalid]="true" placeholder="Select role…" />
      </gw-form-field>
    `,
  }),
};
