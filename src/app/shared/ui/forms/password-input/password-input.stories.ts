import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwPasswordInputComponent } from './password-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwPasswordInputComponent> = {
  title: 'Forms/Password Input',
  component: GwPasswordInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwPasswordInputComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwPasswordInputComponent>;

export const Basic: Story = { args: { placeholder: '••••••••' } };

export const WithStrengthMeter: Story = {
  render: () => ({
    props: { ctrl: new FormControl('') },
    template: `
      <gw-form-field label="New password" hint="At least 8 characters with mixed case + numbers.">
        <gw-password-input [formControl]="ctrl" autocomplete="new-password" [showStrength]="true" />
      </gw-form-field>`,
  }),
};
