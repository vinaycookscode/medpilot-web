import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { GwInputComponent } from './input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwInputComponent> = {
  title: 'Forms/Input',
  component: GwInputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule, GwInputComponent, GwFormFieldComponent],
    }),
  ],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<GwInputComponent>;

export const Basic: Story = {
  args: { placeholder: 'Enter your name', type: 'text', size: 'md' },
};

export const WithFormField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <gw-form-field label="Email address" hint="We'll never share your email." required>
        <gw-input [type]="type" [size]="size" placeholder="you@clinic.com" />
      </gw-form-field>
    `,
  }),
  args: { type: 'email', size: 'md' },
};

export const ErrorState: Story = {
  render: (args) => ({
    props: args,
    template: `
      <gw-form-field label="Password" error="Password must be at least 8 characters." required>
        <gw-input type="password" [invalid]="true" placeholder="••••••••" />
      </gw-form-field>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; width:320px;">
        <gw-input size="sm" placeholder="Small" />
        <gw-input size="md" placeholder="Medium (default)" />
        <gw-input size="lg" placeholder="Large" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { ctrl: new FormControl({ value: 'Pre-filled, can\'t edit', disabled: true }) },
    template: `<gw-input [formControl]="ctrl" />`,
  }),
};

export const ReactiveValidation: Story = {
  render: () => ({
    props: {
      ctrl: new FormControl('', [Validators.required, Validators.email]),
    },
    template: `
      <gw-form-field
        label="Email"
        [error]="ctrl.touched && ctrl.invalid ? (ctrl.errors?.['required'] ? 'Email is required' : 'Enter a valid email') : null"
        required>
        <gw-input [formControl]="ctrl" type="email" [invalid]="ctrl.touched && ctrl.invalid" placeholder="you@clinic.com" />
      </gw-form-field>
      <p style="font-size:12px;color:#6c6c70;margin-top:8px;">Touched: {{ ctrl.touched }} · Valid: {{ ctrl.valid }} · Value: {{ ctrl.value }}</p>
    `,
  }),
};
