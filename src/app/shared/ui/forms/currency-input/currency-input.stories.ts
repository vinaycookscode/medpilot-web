import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwCurrencyInputComponent } from './currency-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwCurrencyInputComponent> = {
  title: 'Forms/Currency Input',
  component: GwCurrencyInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwCurrencyInputComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwCurrencyInputComponent>;

export const Rupee: Story = { args: { placeholder: '0.00' } };

export const WithFormField: Story = {
  render: () => ({
    props: { ctrl: new FormControl<number | null>(500) },
    template: `
      <gw-form-field label="Consultation fee" required>
        <gw-currency-input [formControl]="ctrl" />
      </gw-form-field>`,
  }),
};

export const NoDecimals: Story = {
  render: () => ({
    template: `<gw-currency-input [decimals]="0" placeholder="0" />`,
  }),
};
