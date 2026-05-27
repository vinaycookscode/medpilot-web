import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GwTagsInputComponent } from './tags-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwTagsInputComponent> = {
  title: 'Forms/Tags Input',
  component: GwTagsInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [CommonModule, FormsModule, ReactiveFormsModule, GwTagsInputComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwTagsInputComponent>;

export const Basic: Story = {
  render: () => ({
    props: { ctrl: new FormControl<string[]>(['Diabetic', 'Hypertensive']) },
    template: `
      <div style="width:420px;">
        <gw-form-field label="Patient flags" hint="Press Enter or comma to add.">
          <gw-tags-input [formControl]="ctrl" placeholder="Add a flag…" />
        </gw-form-field>
        <p style="margin-top:8px;font-size:12px;color:#6c6c70;">Value: <strong>{{ ctrl.value | json }}</strong></p>
      </div>`,
  }),
};

export const Limited: Story = {
  render: () => ({
    template: `<gw-tags-input [max]="3" placeholder="Up to 3 tags only" />`,
  }),
};
