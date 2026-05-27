import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GwFormFieldComponent } from './form-field.component';
import { GwInputComponent } from '../input/input.component';
import { GwSelectComponent } from '../select/select.component';
import { GwTextareaComponent } from '../textarea/textarea.component';

const meta: Meta<GwFormFieldComponent> = {
  title: 'Forms/Form Field',
  component: GwFormFieldComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule, ReactiveFormsModule,
        GwFormFieldComponent, GwInputComponent, GwSelectComponent, GwTextareaComponent,
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<GwFormFieldComponent>;

export const Label: Story = {
  render: () => ({
    template: `
      <gw-form-field label="Full name">
        <gw-input placeholder="Jane Doe" />
      </gw-form-field>
    `,
  }),
};

export const LabelHint: Story = {
  render: () => ({
    template: `
      <gw-form-field label="Phone" hint="Used for SMS reminders only.">
        <gw-input type="tel" placeholder="+91 99999 99999" />
      </gw-form-field>
    `,
  }),
};

export const RequiredWithError: Story = {
  render: () => ({
    template: `
      <gw-form-field label="Email" error="Please enter a valid email." required>
        <gw-input type="email" [invalid]="true" placeholder="you@clinic.com" />
      </gw-form-field>
    `,
  }),
};

export const Stack: Story = {
  render: () => ({
    props: {
      roles: [
        { value: 'consultant', label: 'Consultant' },
        { value: 'rmo',        label: 'RMO' },
        { value: 'nursing',    label: 'Nursing' },
      ],
    },
    template: `
      <div style="display:grid; gap:16px; max-width:420px;">
        <gw-form-field label="First name" required>
          <gw-input placeholder="Jane" />
        </gw-form-field>
        <gw-form-field label="Last name" required>
          <gw-input placeholder="Doe" />
        </gw-form-field>
        <gw-form-field label="Role" required>
          <gw-select [options]="roles" placeholder="Select role…" />
        </gw-form-field>
        <gw-form-field label="Notes" hint="Optional — visible to admin only.">
          <gw-textarea [rows]="3" />
        </gw-form-field>
      </div>
    `,
  }),
};
