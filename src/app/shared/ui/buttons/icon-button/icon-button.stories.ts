import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwIconButtonComponent } from './icon-button.component';

const meta: Meta<GwIconButtonComponent> = {
  title: 'Buttons/Icon Button',
  component: GwIconButtonComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwIconButtonComponent] })],
};
export default meta;
type Story = StoryObj<GwIconButtonComponent>;

export const Default: Story = {
  args: { icon: 'edit', ariaLabel: 'Edit', variant: 'ghost', size: 'md' },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:8px;">
        <gw-icon-button icon="edit" ariaLabel="Edit" variant="primary" />
        <gw-icon-button icon="trash" ariaLabel="Delete" variant="danger" />
        <gw-icon-button icon="settings" ariaLabel="Settings" variant="secondary" />
        <gw-icon-button icon="plus" ariaLabel="Add" variant="subtle" />
        <gw-icon-button icon="more-vertical" ariaLabel="More" variant="ghost" />
      </div>`,
  }),
};
