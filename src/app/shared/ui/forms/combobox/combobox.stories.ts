import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwComboboxComponent } from './combobox.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwComboboxComponent> = {
  title: 'Forms/Combobox',
  component: GwComboboxComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwComboboxComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwComboboxComponent>;

const SPECIALITIES = [
  { value: 'cardio', label: 'Cardiology', hint: 'Heart & circulatory' },
  { value: 'neuro',  label: 'Neurology',  hint: 'Brain & nervous system' },
  { value: 'ortho',  label: 'Orthopaedics' },
  { value: 'paeds',  label: 'Paediatrics' },
  { value: 'derm',   label: 'Dermatology' },
  { value: 'ent',    label: 'ENT' },
  { value: 'gen',    label: 'General Medicine' },
  { value: 'gyno',   label: 'Gynaecology' },
  { value: 'psy',    label: 'Psychiatry', disabled: true },
];

export const Basic: Story = { args: { options: SPECIALITIES, placeholder: 'Pick a specialty…' } };

export const WithFormField: Story = {
  render: () => ({
    props: { opts: SPECIALITIES, ctrl: new FormControl<string | null>(null) },
    template: `
      <div style="width:360px;">
        <gw-form-field label="Specialty" required>
          <gw-combobox [options]="opts" [formControl]="ctrl" placeholder="Search…" />
        </gw-form-field>
        <p style="margin-top:8px;font-size:12px;color:#6c6c70;">Value: <strong>{{ ctrl.value ?? '(none)' }}</strong></p>
      </div>`,
  }),
};
