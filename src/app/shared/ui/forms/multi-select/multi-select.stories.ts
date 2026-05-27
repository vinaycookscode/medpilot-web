import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwMultiSelectComponent } from './multi-select.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwMultiSelectComponent> = {
  title: 'Forms/Multi-Select',
  component: GwMultiSelectComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [CommonModule, FormsModule, ReactiveFormsModule, GwMultiSelectComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwMultiSelectComponent>;

const WARDS = [
  { value: 'icu',   label: 'ICU' },
  { value: 'gen',   label: 'General Ward' },
  { value: 'priv',  label: 'Private Room' },
  { value: 'mat',   label: 'Maternity' },
  { value: 'paeds', label: 'Paediatrics' },
  { value: 'ot',    label: 'OT' },
];

export const Basic: Story = {
  render: () => ({
    props: { opts: WARDS, ctrl: new FormControl<string[]>(['icu', 'gen']) },
    template: `
      <div style="width:380px;">
        <gw-form-field label="Allowed wards" hint="Restricts where this nurse can be scheduled.">
          <gw-multi-select [options]="opts" [formControl]="ctrl" />
        </gw-form-field>
        <p style="margin-top:8px;font-size:12px;color:#6c6c70;">Value: <strong>{{ ctrl.value | json }}</strong></p>
      </div>`,
  }),
};
