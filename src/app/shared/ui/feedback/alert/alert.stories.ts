import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwAlertComponent } from './alert.component';
import { GwButtonComponent } from '../../buttons/button/button.component';

const meta: Meta<GwAlertComponent> = {
  title: 'Feedback/Alert',
  component: GwAlertComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwAlertComponent, GwButtonComponent] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
  },
};
export default meta;
type Story = StoryObj<GwAlertComponent>;

export const Info: Story = {
  args: { variant: 'info', title: 'New release available', dismissible: false },
  render: (args) => ({
    props: args,
    template: `<gw-alert [variant]="variant" [title]="title" [dismissible]="dismissible">
      Version 2.1.0 is now available — includes the new permissions matrix.
    </gw-alert>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; max-width:560px;">
        <gw-alert variant="info" title="Heads up">
          The maintenance window starts at 02:00 IST tonight.
        </gw-alert>
        <gw-alert variant="success" title="Patient discharged">
          Mrs. Sharma's discharge summary has been emailed.
        </gw-alert>
        <gw-alert variant="warning" title="Bed capacity at 85%">
          Consider deferring elective admissions.
        </gw-alert>
        <gw-alert variant="danger" title="Lab results overdue">
          3 critical results have been pending for over 4 hours.
        </gw-alert>
      </div>`,
  }),
};

export const WithActions: Story = {
  render: () => ({
    template: `
      <gw-alert variant="warning" title="Unsaved changes" [dismissible]="true" style="max-width:520px;">
        Your edits to the rotation schedule haven't been saved.
        <div gw-alert-actions>
          <gw-button variant="ghost" size="sm">Discard</gw-button>
          <gw-button variant="primary" size="sm">Save now</gw-button>
        </div>
      </gw-alert>`,
  }),
};

export const Subtle: Story = {
  args: { variant: 'info', subtle: true, title: 'Inside a card' },
  render: (args) => ({
    props: args,
    template: `<gw-alert [variant]="variant" [subtle]="subtle" [title]="title">
      Use the subtle variant when the alert sits inside a card or panel.
    </gw-alert>`,
  }),
};
