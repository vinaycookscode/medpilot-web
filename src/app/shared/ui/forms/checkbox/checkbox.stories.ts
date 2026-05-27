import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwCheckboxComponent } from './checkbox.component';

const meta: Meta<GwCheckboxComponent> = {
  title: 'Forms/Checkbox',
  component: GwCheckboxComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwCheckboxComponent] }),
  ],
};
export default meta;

type Story = StoryObj<GwCheckboxComponent>;

export const Basic: Story = { args: { label: 'I agree to the terms' } };

export const Checked: Story = {
  render: () => ({
    props: { ctrl: new FormControl(true) },
    template: `<gw-checkbox label="Send me updates" [formControl]="ctrl" />`,
  }),
};

export const Indeterminate: Story = {
  args: { label: 'Select all rows', indeterminate: true },
};

export const Disabled: Story = {
  render: () => ({
    props: { ctrl: new FormControl({ value: true, disabled: true }) },
    template: `<gw-checkbox label="Locked option" [formControl]="ctrl" />`,
  }),
};

export const Invalid: Story = {
  args: { label: 'I have read the policy', invalid: true },
};

export const Group: Story = {
  render: () => ({
    props: {
      form: { sms: true, email: false, push: true, whatsapp: false },
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <gw-checkbox label="SMS"      [ngModel]="form.sms"      (ngModelChange)="form.sms = $event" />
        <gw-checkbox label="Email"    [ngModel]="form.email"    (ngModelChange)="form.email = $event" />
        <gw-checkbox label="Push"     [ngModel]="form.push"     (ngModelChange)="form.push = $event" />
        <gw-checkbox label="WhatsApp" [ngModel]="form.whatsapp" (ngModelChange)="form.whatsapp = $event" />
      </div>
    `,
  }),
};
