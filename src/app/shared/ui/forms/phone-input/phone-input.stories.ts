import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwPhoneInputComponent } from './phone-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwPhoneInputComponent> = {
  title: 'Forms/Phone Input',
  component: GwPhoneInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwPhoneInputComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwPhoneInputComponent>;

export const India: Story = {
  render: () => ({
    props: { ctrl: new FormControl('') },
    template: `
      <gw-form-field label="Mobile number" hint="Used for SMS reminders.">
        <gw-phone-input [formControl]="ctrl" />
      </gw-form-field>
      <p style="margin-top:8px;font-size:12px;color:#6c6c70;">Stored: <strong>{{ ctrl.value }}</strong></p>`,
  }),
};
