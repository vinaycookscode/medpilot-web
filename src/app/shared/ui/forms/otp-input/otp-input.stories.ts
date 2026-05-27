import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwOtpInputComponent } from './otp-input.component';

const meta: Meta<GwOtpInputComponent> = {
  title: 'Forms/OTP Input',
  component: GwOtpInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwOtpInputComponent] })],
};
export default meta;
type Story = StoryObj<GwOtpInputComponent>;

export const Default: Story = {
  render: () => ({
    props: { ctrl: new FormControl('') },
    template: `
      <gw-otp-input [length]="6" [formControl]="ctrl" />
      <p style="margin-top:12px;font-size:12px;color:#6c6c70;">Value: <strong>{{ ctrl.value }}</strong></p>
    `,
  }),
};

export const ABHA4Digit: Story = {
  render: () => ({ template: `<gw-otp-input [length]="4" />` }),
};
