import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwTextareaComponent } from './textarea.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwTextareaComponent> = {
  title: 'Forms/Textarea',
  component: GwTextareaComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule, GwTextareaComponent, GwFormFieldComponent],
    }),
  ],
};
export default meta;

type Story = StoryObj<GwTextareaComponent>;

export const Basic: Story = {
  args: { placeholder: 'Write your notes…', rows: 4 },
};

export const WithFormField: Story = {
  render: () => ({
    template: `
      <gw-form-field label="Discharge notes" hint="Visible to the patient on summary.">
        <gw-textarea placeholder="Stable, follow up in 2 weeks…" [rows]="5" />
      </gw-form-field>
    `,
  }),
};

export const AutoResize: Story = {
  render: () => ({
    template: `
      <gw-form-field label="Auto-resizes as you type">
        <gw-textarea [autoResize]="true" placeholder="Start typing and watch this grow…" />
      </gw-form-field>
    `,
  }),
};

export const ErrorState: Story = {
  render: () => ({
    props: { ctrl: new FormControl('', { nonNullable: true }) },
    template: `
      <gw-form-field label="Reason" error="Reason is required." required>
        <gw-textarea [formControl]="ctrl" [invalid]="true" placeholder="Why are they being admitted?" />
      </gw-form-field>
    `,
  }),
};
