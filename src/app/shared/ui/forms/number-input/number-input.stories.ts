import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwNumberInputComponent } from './number-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwNumberInputComponent> = {
  title: 'Forms/Number Input',
  component: GwNumberInputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwNumberInputComponent, GwFormFieldComponent] }),
  ],
};
export default meta;
type Story = StoryObj<GwNumberInputComponent>;

export const Basic: Story = { args: { placeholder: '0', min: 0, max: 100, step: 1 } };

export const WithFormField: Story = {
  render: () => ({
    props: { ctrl: new FormControl(1) },
    template: `
      <gw-form-field label="Quantity" hint="Adjust dose count." required>
        <gw-number-input [min]="1" [max]="20" [formControl]="ctrl" />
      </gw-form-field>`,
  }),
};

export const WithoutSteppers: Story = {
  render: () => ({
    template: `<gw-number-input [steppers]="false" placeholder="Plain number" />`,
  }),
};
