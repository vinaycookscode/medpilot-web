import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GwDateInputComponent } from './date-input.component';
import { GwTimeInputComponent } from '../time-input/time-input.component';
import { GwDatetimeInputComponent } from '../datetime-input/datetime-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwDateInputComponent> = {
  title: 'Forms/Date & Time',
  component: GwDateInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({
    imports: [
      FormsModule, ReactiveFormsModule,
      GwDateInputComponent, GwTimeInputComponent, GwDatetimeInputComponent,
      GwFormFieldComponent,
    ],
  })],
};
export default meta;
type Story = StoryObj<GwDateInputComponent>;

export const All: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:16px; max-width:320px;">
        <gw-form-field label="Date of birth">
          <gw-date-input />
        </gw-form-field>
        <gw-form-field label="Appointment time">
          <gw-time-input />
        </gw-form-field>
        <gw-form-field label="Admission date & time">
          <gw-datetime-input />
        </gw-form-field>
      </div>`,
  }),
};
