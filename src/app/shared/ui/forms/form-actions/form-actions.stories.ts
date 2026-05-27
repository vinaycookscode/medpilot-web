import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwFormActionsComponent } from './form-actions.component';
import { GwButtonComponent } from '../../buttons/button/button.component';

const meta: Meta<GwFormActionsComponent> = {
  title: 'Forms/Form Actions',
  component: GwFormActionsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwFormActionsComponent, GwButtonComponent] })],
  argTypes: { align: { control: 'inline-radio', options: ['left', 'right', 'between'] } },
};
export default meta;
type Story = StoryObj<GwFormActionsComponent>;

export const Right: Story = {
  render: (args) => ({
    props: args,
    template: `
      <gw-form-actions [align]="align" [bordered]="bordered">
        <gw-button variant="ghost">Cancel</gw-button>
        <gw-button variant="primary">Save changes</gw-button>
      </gw-form-actions>`,
  }),
  args: { align: 'right', bordered: true },
};

export const Between: Story = {
  render: () => ({
    template: `
      <gw-form-actions align="between">
        <gw-button variant="danger">Delete</gw-button>
        <div>
          <gw-button variant="ghost" style="margin-right:8px">Cancel</gw-button>
          <gw-button variant="primary">Save</gw-button>
        </div>
      </gw-form-actions>`,
  }),
};
