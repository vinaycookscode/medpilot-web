import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GwFormSectionComponent } from './form-section.component';
import { GwFormActionsComponent } from '../form-actions/form-actions.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';
import { GwInputComponent } from '../input/input.component';
import { GwSelectComponent } from '../select/select.component';
import { GwButtonComponent } from '../../buttons/button/button.component';

const meta: Meta<GwFormSectionComponent> = {
  title: 'Forms/Form Section',
  component: GwFormSectionComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({
    imports: [
      FormsModule, ReactiveFormsModule,
      GwFormSectionComponent, GwFormActionsComponent, GwFormFieldComponent,
      GwInputComponent, GwSelectComponent, GwButtonComponent,
    ],
  })],
};
export default meta;
type Story = StoryObj<GwFormSectionComponent>;

export const FullForm: Story = {
  render: () => ({
    props: { roles: [{ value: 'consultant', label: 'Consultant' }, { value: 'nursing', label: 'Nursing' }] },
    template: `
      <div style="width:560px;">
        <gw-form-section title="Personal details" description="Basic information about the staff member.">
          <gw-form-field label="First name" required><gw-input placeholder="Jane" /></gw-form-field>
          <gw-form-field label="Last name" required><gw-input placeholder="Doe" /></gw-form-field>
        </gw-form-section>

        <gw-form-section title="Role & access" description="Determines sidebar items and permissions.">
          <gw-form-field label="Role" required><gw-select [options]="roles" placeholder="Select role…" /></gw-form-field>
        </gw-form-section>

        <gw-form-section title="Advanced" [collapsible]="true" [collapsed]="true" description="Optional clinical info — collapsible.">
          <gw-form-field label="Medical reg. no."><gw-input placeholder="MCI-12345" /></gw-form-field>
        </gw-form-section>

        <gw-form-actions align="right">
          <gw-button variant="ghost">Cancel</gw-button>
          <gw-button variant="primary">Save changes</gw-button>
        </gw-form-actions>
      </div>`,
  }),
};
